import { container } from './container';

/**
 * Everything someone's screens need, for all their projects, loaded once when the app opens;
 * the realtime feed keeps it fresh. Small teams produce little data: navigation never waits.
 */
export async function loadSnapshot(userId: string) {
	const {
		identity,
		projects,
		tasks,
		chat,
		files,
		vault,
		planning,
		roadmap,
		framing,
		activity,
		hub
	} = container;
	const { projects: projectList, members } = await projects.of(userId);
	const ids = projectList.map((p) => p.id);
	const people = [...new Set([userId, ...members.map((m) => m.userId)])];
	const [
		users,
		taskList,
		channels,
		channelStates,
		fileList,
		folders,
		vaultList,
		slots,
		blocks,
		activities,
		notifications,
		visits,
		questions,
		milestones,
		decisions,
		hypotheses,
		readings,
		metrics,
		releases,
		components,
		framed,
		aiMonth
	] = await Promise.all([
		identity.listByIds(people),
		tasks.ofProjects(ids),
		chat.channels(ids),
		chat.states(userId, ids),
		files.ofProjects(ids),
		files.foldersOf(ids),
		vault.ofProjects(ids),
		planning.slotsOf(people),
		planning.blocksOf(ids),
		activity.recent(ids),
		activity.notificationsFor(userId),
		activity.visitsOf(userId),
		chat.openQuestions(ids),
		roadmap.milestonesOf(ids),
		roadmap.decisionsOf(ids),
		roadmap.hypothesesOf(ids),
		roadmap.readingsOf(ids),
		roadmap.metricsOf(ids),
		roadmap.releasesOf(ids),
		tasks.componentsOf(ids),
		framing.of(ids),
		container.assistant.monthUsage(ids)
	]);
	return {
		meId: userId,
		online: hub.online().filter((id) => people.includes(id)),
		users,
		projects: projectList,
		members,
		tasks: taskList,
		channels,
		channelStates,
		files: fileList,
		folders,
		vault: vaultList,
		slots,
		blocks,
		activities,
		notifications: notifications.filter((n) => ids.includes(n.projectId)),
		visits: visits.filter((v) => ids.includes(v.projectId)),
		/** Every open question of my projects: mine to answer, mine waiting, a task waiting. */
		questions,
		milestones,
		decisions,
		hypotheses,
		readings,
		metrics,
		releases,
		components,
		...framed,
		/** The AI project manager: on or off on this server, and what it cost this month. */
		assistant: {
			enabled: container.assistant.enabled(),
			quota: container.assistant.quota,
			month: aiMonth
		}
	};
}

export type Snapshot = Awaited<ReturnType<typeof loadSnapshot>>;
