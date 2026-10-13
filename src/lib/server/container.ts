/** Composition root: the only place where modules meet their adapters and each other. */
import { createActivity } from '$lib/modules/activity';
import {
	drizzleActivities,
	drizzleNotifications
} from '$lib/modules/activity/infrastructure/repositories';
import { createChat, type Chat } from '$lib/modules/chat';
import { drizzleChannels, drizzleReads } from '$lib/modules/chat/infrastructure/channel-repository';
import { drizzleMessages } from '$lib/modules/chat/infrastructure/message-repository';
import { createFiles } from '$lib/modules/files';
import { diskStorage } from '$lib/modules/files/infrastructure/disk-storage';
import { drizzleFiles } from '$lib/modules/files/infrastructure/file-repository';
import { createIdentity } from '$lib/modules/identity';
import { randomTokens, scryptHasher } from '$lib/modules/identity/infrastructure/crypto';
import {
	drizzleInvitations,
	drizzleSessions,
	drizzleUsers
} from '$lib/modules/identity/infrastructure/repositories';
import { systemClock as clock } from '$lib/modules/kernel/application/ports';
import { createPlanning } from '$lib/modules/planning';
import { drizzleAvailability } from '$lib/modules/planning/infrastructure/availability-repository';
import { createProjects } from '$lib/modules/projects';
import { drizzleProjects } from '$lib/modules/projects/infrastructure/project-repository';
import { createTasks } from '$lib/modules/tasks';
import { drizzleTasks } from '$lib/modules/tasks/infrastructure/task-repository';
import { createVault } from '$lib/modules/vault';
import { aesCipher } from '$lib/modules/vault/infrastructure/aes-cipher';
import { drizzleVault } from '$lib/modules/vault/infrastructure/vault-repository';
import type { SecretCipher } from '$lib/modules/vault/application/ports';
import { db } from './db';
import { config } from './env';
import { feedFor, inboxFor } from './realtime/feeds';
import { hub } from './realtime/hub';

const users = drizzleUsers(db);
const projectRepository = drizzleProjects(db);
const projectExists = async (id: string) => (await projectRepository.get(id)) !== null;

const activity = createActivity({
	activities: drizzleActivities(db),
	notifications: drizzleNotifications(db),
	clock,
	feed: feedFor(hub, 'activities'),
	inbox: inboxFor(hub)
});

const identity = createIdentity({
	users,
	sessions: drizzleSessions(db),
	invitations: drizzleInvitations(db),
	hasher: scryptHasher,
	tokens: randomTokens,
	clock,
	feed: feedFor(hub, 'users')
});

const files = createFiles({
	files: drizzleFiles(db),
	blobs: diskStorage(config.storageDir()),
	projectExists,
	clock,
	feed: feedFor(hub, 'files'),
	activity: activity.log
});

const chat: Chat = createChat({
	channels: drizzleChannels(db),
	messages: drizzleMessages(db),
	reads: drizzleReads(db),
	attachments: { attach: files.attachToMessage },
	people: { names: async () => new Map((await users.list()).map((u) => [u.id, u.name])) },
	clock,
	channelFeed: feedFor(hub, 'channels'),
	messageFeed: feedFor(hub, 'messages'),
	activity: activity.log,
	notifier: activity.notifier
});

const projects = createProjects({
	projects: projectRepository,
	clock,
	feed: feedFor(hub, 'projects'),
	activity: activity.log,
	hooks: {
		created: async (project, actorId) => void (await chat.createProjectChannel(project, actorId))
	}
});

const tasks = createTasks({
	tasks: drizzleTasks(db),
	directory: { projectExists, userExists: async (id) => (await users.findById(id)) !== null },
	clock,
	feed: feedFor(hub, 'tasks'),
	activity: activity.log,
	notifier: activity.notifier
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
	projectExists,
	clock,
	feed: feedFor(hub, 'vault'),
	activity: activity.log
});

const planning = createPlanning({
	availability: drizzleAvailability(db),
	clock,
	feed: feedFor(hub, 'availability')
});

export const container = { identity, projects, tasks, chat, files, vault, planning, activity, hub };
export type Container = typeof container;
