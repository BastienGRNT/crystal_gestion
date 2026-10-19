/** Composition root: the only place where modules meet their adapters and each other. */
import { createActivity } from '$lib/modules/activity';
import {
	drizzleActivities,
	drizzleNotifications,
	drizzleVisits
} from '$lib/modules/activity/infrastructure/repositories';
import { createChat } from '$lib/modules/chat';
import { drizzleChannels, drizzleReads } from '$lib/modules/chat/infrastructure/channel-repository';
import { drizzleMessages } from '$lib/modules/chat/infrastructure/message-repository';
import { createFiles } from '$lib/modules/files';
import { diskStorage } from '$lib/modules/files/infrastructure/disk-storage';
import { drizzleFiles, drizzleFolders } from '$lib/modules/files/infrastructure/file-repository';
import { createIdentity } from '$lib/modules/identity';
import { randomTokens, scryptHasher } from '$lib/modules/identity/infrastructure/crypto';
import { drizzleSessions, drizzleUsers } from '$lib/modules/identity/infrastructure/repositories';
import { systemClock as clock } from '$lib/modules/kernel/application/ports';
import { createPlanning } from '$lib/modules/planning';
import { drizzleBlocks, drizzleSlots } from '$lib/modules/planning/infrastructure/repositories';
import { createProjects } from '$lib/modules/projects';
import { projectAccess } from '$lib/modules/projects/application/access';
import {
	drizzleInvitations,
	drizzleMembers,
	drizzleProjects
} from '$lib/modules/projects/infrastructure/project-repository';
import { createRoadmap } from '$lib/modules/roadmap';
import { currentMilestone } from '$lib/modules/roadmap/domain/milestone';
import {
	drizzleDecisions,
	drizzleHypotheses,
	drizzleMetrics,
	drizzleMilestones,
	drizzleReadings,
	drizzleReleases
} from '$lib/modules/roadmap/infrastructure/repositories';
import { createTasks } from '$lib/modules/tasks';
import { drizzleComponents, drizzleTasks } from '$lib/modules/tasks/infrastructure/task-repository';
import { createVault } from '$lib/modules/vault';
import type { SecretCipher } from '$lib/modules/vault/application/ports';
import { aesCipher } from '$lib/modules/vault/infrastructure/aes-cipher';
import { drizzleVault } from '$lib/modules/vault/infrastructure/vault-repository';
import { db } from './db';
import { config } from './env';
import { byProject, feedFor, inboxFor } from './realtime/feeds';
import { hub } from './realtime/hub';

const users = drizzleUsers(db);
const members = drizzleMembers(db);
const access = projectAccess(members);
const taskRepository = drizzleTasks(db);
const componentRepository = drizzleComponents(db);
const milestoneStore = drizzleMilestones(db);
const messageRepository = drizzleMessages(db);

// Each socket hears about its person's projects and the people they share them with.
hub.configure(async (userId) => {
	const projectIds = await members.projectIdsOf(userId);
	const team = await members.ofProjects(projectIds);
	return { projects: new Set(projectIds), people: new Set([userId, ...team.map((m) => m.userId)]) };
});

const activity = createActivity({
	activities: drizzleActivities(db),
	notifications: drizzleNotifications(db),
	visits: drizzleVisits(db),
	access,
	clock,
	feed: feedFor(hub, 'activities', byProject),
	inbox: inboxFor(hub),
	visitFeed: feedFor(hub, 'visits', (visit) => ({ user: visit.userId }))
});

const identity = createIdentity({
	users,
	sessions: drizzleSessions(db),
	hasher: scryptHasher,
	tokens: randomTokens,
	clock,
	feed: feedFor(hub, 'users', (user) => ({ teammatesOf: user.id }))
});

const tasks = createTasks({
	tasks: taskRepository,
	components: componentRepository,
	componentFeed: feedFor(hub, 'components', byProject),
	milestones: {
		get: (id) => milestoneStore.get(id),
		current: async (projectId) =>
			currentMilestone(await milestoneStore.ofProject(projectId))?.id ?? null
	},
	access,
	clock,
	feed: feedFor(hub, 'tasks', byProject),
	activity: activity.log,
	notifier: activity.notifier
});

const files = createFiles({
	files: drizzleFiles(db),
	folders: drizzleFolders(db),
	blobs: diskStorage(config.storageDir()),
	access,
	clock,
	feed: feedFor(hub, 'files', byProject),
	folderFeed: feedFor(hub, 'folders', byProject),
	activity: activity.log
});

const chat = createChat({
	channels: drizzleChannels(db),
	messages: messageRepository,
	reads: drizzleReads(db),
	attachments: { attach: files.attachToMessage },
	people: {
		names: async () => new Map((await users.list()).map((u) => [u.id, u.name.split(' ')[0]]))
	},
	tasks: { get: tasks.get },
	access,
	clock,
	channelFeed: feedFor(hub, 'channels', byProject),
	messageFeed: feedFor(hub, 'messages', byProject),
	activity: activity.log,
	notifier: activity.notifier
});

const memberFeed = feedFor(hub, 'members', byProject);
// A rejected promise nobody awaits would stop the whole server.
const logRealtimeError = (error: unknown) => console.error('[realtime]', error);

const projects = createProjects({
	projects: drizzleProjects(db),
	members,
	invitations: drizzleInvitations(db),
	tokens: randomTokens,
	nameOf: async (id) => (await users.findById(id))?.name ?? 'Quelqu’un',
	clock,
	feed: feedFor(hub, 'projects', (project) => ({ project: project.id })),
	// Joining or leaving changes who hears what: refresh first, then tell the team (and the person).
	memberFeed: {
		saved: (member) =>
			void hub
				.refresh([member.userId])
				.then(async () => {
					memberFeed.saved(member);
					const user = await users.findById(member.userId);
					if (user)
						hub.toProject(member.projectId, { type: 'saved', collection: 'users', item: user });
				})
				.catch(logRealtimeError),
		removed: (member) => {
			memberFeed.removed(member);
			hub.toUser(member.userId, { type: 'removed', collection: 'members', item: member });
			hub.refresh([member.userId]).catch(logRealtimeError);
		}
	},
	activity: activity.log,
	hooks: {
		created: async (project, actorId) => void (await chat.ensureGeneral(project.id, actorId))
	}
});

// Derived on first use so a build without APP_SECRET still works.
let cipher: SecretCipher | null = null;
const vaultCipher = () => (cipher ??= aesCipher(config.appSecret()));

const vault = createVault({
	vault: drizzleVault(db),
	cipher: {
		encrypt: (plain) => vaultCipher().encrypt(plain),
		decrypt: (c) => vaultCipher().decrypt(c)
	},
	access,
	clock,
	feed: feedFor(hub, 'vault', byProject),
	activity: activity.log
});

const planning = createPlanning({
	slots: drizzleSlots(db),
	blocks: drizzleBlocks(db),
	tasks: { projectOf: async (id) => (await taskRepository.get(id))?.projectId ?? null },
	access,
	clock,
	slotFeed: feedFor(hub, 'slots', (slot) => ({ teammatesOf: slot.userId })),
	blockFeed: feedFor(hub, 'blocks', byProject)
});

const roadmap = createRoadmap({
	milestones: milestoneStore,
	decisions: drizzleDecisions(db),
	hypotheses: drizzleHypotheses(db),
	metrics: drizzleMetrics(db),
	readings: drizzleReadings(db),
	releases: drizzleReleases(db),
	tasks: {
		ofMilestone: (id) => taskRepository.ofMilestone(id),
		ofRelease: (id) => taskRepository.ofRelease(id),
		componentNames: async (projectId) =>
			new Map((await componentRepository.ofProject(projectId)).map((c) => [c.id, c.name])),
		get: tasks.get,
		create: tasks.create,
		move: tasks.update
	},
	channels: {
		async ensure(projectId, name, actorId) {
			const existing = await chat.channels([projectId]);
			if (!existing.some((c) => c.kind === 'custom' && c.name === name))
				await chat.createChannel({ id: crypto.randomUUID(), projectId, name }, actorId);
		}
	},
	messages: { projectOf: async (id) => (await messageRepository.get(id))?.projectId ?? null },
	access,
	clock,
	milestoneFeed: feedFor(hub, 'milestones', byProject),
	decisionFeed: feedFor(hub, 'decisions', byProject),
	hypothesisFeed: feedFor(hub, 'hypotheses', byProject),
	metricFeed: feedFor(hub, 'metrics', byProject),
	readingFeed: feedFor(hub, 'readings', byProject),
	releaseFeed: feedFor(hub, 'releases', byProject),
	activity: activity.log,
	newId: () => crypto.randomUUID()
});

export const container = {
	identity,
	projects,
	tasks,
	chat,
	files,
	vault,
	planning,
	roadmap,
	activity,
	access,
	hub
};
export type Container = typeof container;
