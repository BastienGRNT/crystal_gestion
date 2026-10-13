import type { User } from '$lib/modules/identity/domain/user';
import type { Task } from '$lib/modules/tasks/domain/task';
import type { AppState } from '$lib/client/state/app.svelte';
import { now } from '$lib/client/now.svelte';
import { presenceOf } from '$lib/client/views/presence';

const RECENT_MS = 2 * 86_400_000;

/** Presence of a teammate within a project, recomputed when anything it depends on changes. */
export function presenceFor(app: AppState, user: User, projectId: string) {
	return presenceOf(user, {
		online: app.online,
		slots: app.slots.all,
		tasks: app.tasks.all.filter((t) => t.projectId === projectId),
		now: now.value
	});
}

export function recentlyDone(app: AppState, userId: string, projectId: string, limit = 3): Task[] {
	const since = now.value.getTime() - RECENT_MS;
	return app.tasks.all
		.filter(
			(t) =>
				t.projectId === projectId &&
				t.status === 'done' &&
				t.assigneeId === userId &&
				Date.parse(t.completedAt ?? '') >= since
		)
		.sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''))
		.slice(0, limit);
}

/** The project's team, me first, then in the order they joined. */
export function teamOrder(app: AppState, projectId: string): User[] {
	const members = app.members.all
		.filter((m) => m.projectId === projectId)
		.sort((a, b) => a.joinedAt.localeCompare(b.joinedAt));
	const users = members.flatMap((m) => app.users.get(m.userId) ?? []);
	return [...users.filter((u) => u.id === app.meId), ...users.filter((u) => u.id !== app.meId)];
}
