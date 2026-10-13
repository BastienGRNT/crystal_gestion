/** Composition root: the only place where modules meet their adapters and each other. */
import { createActivity } from '$lib/modules/activity';
import {
	drizzleActivities,
	drizzleNotifications
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
import { createTasks } from '$lib/modules/tasks';
import { drizzleTasks } from '$lib/modules/tasks/infrastructure/task-repository';
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

// Each socket hears about its person's projects and the people they share them with.
hub.configure(async (userId) => {
	const projectIds = await members.projectIdsOf(userId);
	const team = await members.ofProjects(projectIds);
	return { projects: new Set(projectIds), people: new Set([userId, ...team.map((m) => m.userId)]) };
});

const activity = createActivity({
	activities: drizzleActivities(db),
	notifications: drizzleNotifications(db),
	clock,
	feed: feedFor(hub, 'activities', byProject),
	inbox: inboxFor(hub)
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
	messages: drizzleMessages(db),
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
			void hub.refresh([member.userId]).then(async () => {
				memberFeed.saved(member);
				const user = await users.findById(member.userId);
				if (user)
					hub.toProject(member.projectId, { type: 'saved', collection: 'users', item: user });
			}),
		removed: (member) => {
			memberFeed.removed(member);
			hub.toUser(member.userId, { type: 'removed', collection: 'members', item: member });
			void hub.refresh([member.userId]);
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

export const container = {
	identity,
	projects,
	tasks,
	chat,
	files,
	vault,
	planning,
	activity,
	access,
	hub
};
export type Container = typeof container;
