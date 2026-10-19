import {
	activeComponents,
	ensureRoomForComponent,
	validComponentName,
	type Component
} from '$lib/modules/tasks/domain/component';
import { positionAtEnd } from '$lib/modules/tasks/domain/position';
import {
	applyPatch,
	newTask,
	type ChecklistItem,
	type Task,
	type TaskPatch
} from '$lib/modules/tasks/domain/task';
import { send } from '../api';
import type { AppState } from '../state/app.svelte';
import { deleteWithUndo, toasts } from '../toasts.svelte';
import { attempt, settle } from './optimistic';

export interface TaskDraft extends Omit<
	TaskPatch,
	'title' | 'reviewerId' | 'blockedReason' | 'releaseId'
> {
	projectId: string;
	title: string;
}

const endOf = (app: AppState, projectId: string) =>
	positionAtEnd(
		app.tasks.all
			.filter((t) => t.projectId === projectId)
			.map((t) => t.position)
			.sort((a, b) => a - b)
	);

export function taskActions(app: AppState) {
	function update(id: string, patch: TaskPatch) {
		const current = app.tasks.get(id);
		const next = current && attempt(() => applyPatch(current, patch, app.meId, new Date()));
		if (!current || !next) return;
		app.tasks.upsert(next);
		settle(
			app,
			id,
			send('tasks.update', { id, ...patch }),
			(task) => app.tasks.upsert(task),
			() => app.tasks.upsert(current)
		);
	}

	/** A status change with a way back, for moves made by a single click. */
	function move(id: string, patch: TaskPatch, message: string) {
		const before = app.tasks.get(id);
		if (!before) return;
		update(id, patch);
		toasts.show(message, {
			tone: 'success',
			action: {
				label: 'Annuler',
				run: () => update(id, { status: before.status, reviewerId: before.reviewerId })
			}
		});
	}

	const checklistOf = (id: string) => app.tasks.get(id)?.checklist ?? [];

	return {
		create(draft: TaskDraft): Task | null {
			const id = crypto.randomUUID();
			const input = { ...draft, id, position: draft.position ?? endOf(app, draft.projectId) };
			const task = attempt(() => newTask({ ...input, number: 0 }, app.meId, new Date()));
			if (!task) return null;
			app.tasks.upsert(task);
			settle(
				app,
				id,
				send('tasks.create', input),
				(saved) => app.tasks.upsert(saved),
				() => app.tasks.remove(id)
			);
			return task;
		},

		update,

		complete: (id: string) => move(id, { status: 'done' }, 'Terminé, bravo'),
		start: (id: string) =>
			move(
				id,
				{ status: 'doing', assigneeId: app.tasks.get(id)?.assigneeId ?? app.meId },
				'C’est parti'
			),
		askReview: (id: string) => move(id, { status: 'review' }, 'Envoyé en revue'),
		block: (id: string, reason: string) => update(id, { blockedReason: reason }),
		unblock: (id: string) => update(id, { blockedReason: null }),

		setChecklist: (id: string, checklist: ChecklistItem[]) => update(id, { checklist }),
		addStep(id: string, text: string) {
			if (!text.trim()) return;
			update(id, {
				checklist: [...checklistOf(id), { id: crypto.randomUUID(), text: text.trim(), done: false }]
			});
		},
		toggleStep: (id: string, stepId: string) =>
			update(id, {
				checklist: checklistOf(id).map((s) => (s.id === stepId ? { ...s, done: !s.done } : s))
			}),
		removeStep: (id: string, stepId: string) =>
			update(id, { checklist: checklistOf(id).filter((s) => s.id !== stepId) }),

		remove(id: string) {
			const task = app.tasks.get(id);
			if (!task) return;
			deleteWithUndo(
				'Tâche supprimée',
				() => app.tasks.remove(id),
				() => app.tasks.upsert(task),
				() =>
					void send('tasks.delete', { id }, { keepalive: true }).catch(() => app.tasks.upsert(task))
			);
		},

		/** A new part of the product: one line, not a new project. */
		addComponent(projectId: string, name: string): boolean {
			const others = app.components.all.filter((c) => c.projectId === projectId);
			const component = attempt<Component>(() => {
				ensureRoomForComponent(others);
				return {
					id: crypto.randomUUID(),
					projectId,
					name: validComponentName(name),
					color: activeComponents(others).length % 8,
					position: Math.max(0, ...others.map((c) => c.position)) + 1,
					archivedAt: null,
					createdAt: new Date().toISOString()
				};
			});
			if (!component) return false;
			app.components.upsert(component);
			settle(
				app,
				component.id,
				send('components.create', {
					id: component.id,
					projectId,
					name: component.name,
					color: component.color
				}),
				(saved) => app.components.upsert(saved),
				() => app.components.remove(component.id)
			);
			return true;
		},

		updateComponent(id: string, patch: { name?: string; color?: number }) {
			const current = app.components.get(id);
			const next =
				current &&
				attempt(() => ({
					...current,
					...patch,
					...(patch.name !== undefined && { name: validComponentName(patch.name) })
				}));
			if (!current || !next) return;
			app.components.upsert(next);
			settle(
				app,
				id,
				send('components.update', { id, ...patch }),
				(saved) => app.components.upsert(saved),
				() => app.components.upsert(current)
			);
		},

		/** Its tasks keep their history: a module that holds some is archived, not deleted. */
		removeComponent(id: string) {
			const component = app.components.get(id);
			if (!component) return;
			deleteWithUndo(
				`Module « ${component.name} » retiré`,
				() => app.components.remove(id),
				() => app.components.upsert(component),
				() =>
					void send('components.delete', { id }, { keepalive: true })
						.then((kept) => kept && app.components.upsert(kept))
						.catch(() => app.components.upsert(component))
			);
		}
	};
}
