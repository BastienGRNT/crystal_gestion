import type { Task, TaskFields, TaskStatus } from '$lib/modules/tasks/domain/task';
import { send } from '../commands';
import { combine, draftId, optimistic } from '../live/optimistic';
import type { ProjectStore } from '../project-store.svelte';
import { createOptimistically } from './create';
import { timerActions } from './timer';

export type NewTask = Pick<TaskFields, 'title'> &
	Partial<TaskFields> & { status?: TaskStatus; position?: number };

export function taskActions(store: ProjectStore, meId: string) {
	const projectId = () => store.project.id;
	const now = () => new Date().toISOString();
	const draft = (input: NewTask): Task => ({
		id: draftId(),
		ref: 'T-…',
		kind: 'task',
		projectId: projectId(),
		description: '',
		featureId: null,
		dueDate: null,
		important: null,
		urgent: null,
		assigneeIds: [],
		status: 'todo',
		position: Number.MAX_SAFE_INTEGER,
		completedAt: null,
		createdAt: now(),
		updatedAt: now(),
		...input
	});
	const timer = timerActions(store, meId);
	const move = (id: string, status: TaskStatus, position?: number) =>
		optimistic(
			() =>
				combine(
					store.tasks.patch(id, {
						status,
						...(position === undefined ? {} : { position }),
						completedAt: status === 'done' ? now() : null
					}),
					status === 'done' ? timer.stopLocally(id) : () => {}
				),
			() => send('tasks.move', { projectId: projectId(), id, status, position })
		);
	return {
		create: (input: NewTask) =>
			createOptimistically(store, 'task', draft(input), () =>
				send('tasks.create', { projectId: projectId(), ...input })
			),
		update: (id: string, changes: Partial<TaskFields>) =>
			optimistic(
				() => store.tasks.patch(id, { ...changes, updatedAt: now() }),
				() => send('tasks.update', { projectId: projectId(), id, changes })
			),
		move,
		remove: (id: string) =>
			optimistic(
				() => combine(store.tasks.remove(id), timer.stopLocally(id)),
				() => send('tasks.delete', { projectId: projectId(), id })
			),
		start: async (id: string) => {
			const apply = () =>
				combine(store.tasks.patch(id, { status: 'in_progress' }), timer.startLocally(id));
			const started = await optimistic(apply, () =>
				send('tasks.start', { projectId: projectId(), id })
			);
			if (started) timer.confirm(started.timer);
		},
		stopTimer: () =>
			optimistic(
				() => timer.stopLocally(),
				() => send('tasks.pause', {})
			),
		finish: (id: string) => move(id, 'done')
	};
}
