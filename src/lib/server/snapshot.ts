import { container } from './container';

/**
 * Everything a screen needs, loaded once when the app opens; the realtime feed keeps it fresh.
 * A team of a few people produces little data, so navigation never waits for the network.
 */
export async function loadSnapshot(userId: string) {
	const { identity, projects, tasks, chat, files, vault, planning, activity, hub } = container;
	await chat.ensureGeneral(userId);
	const [
		users,
		projectList,
		taskList,
		channels,
		channelStates,
		fileList,
		vaultList,
		availability,
		activities,
		notifications
	] = await Promise.all([
		identity.list(),
		projects.list(),
		tasks.list(),
		chat.channels(),
		chat.states(userId),
		files.list(),
		vault.list(),
		planning.all(),
		activity.recent(),
		activity.notificationsFor(userId)
	]);
	return {
		meId: userId,
		online: hub.online(),
		users,
		projects: projectList,
		tasks: taskList,
		channels,
		channelStates,
		files: fileList,
		vault: vaultList,
		availability,
		activities,
		notifications
	};
}

export type Snapshot = Awaited<ReturnType<typeof loadSnapshot>>;
