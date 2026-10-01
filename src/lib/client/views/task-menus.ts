import { X } from '@lucide/svelte';
import {
	isArchived,
	MOSCOW,
	MOSCOW_HINTS,
	MOSCOW_LABELS,
	type Feature,
	type Moscow
} from '$lib/modules/features/domain/feature';
import type { Member } from '$lib/modules/projects/domain/project';
import { STATUS_LABELS, TASK_STATUSES, type TaskStatus } from '$lib/modules/tasks/domain/task';
import { PRIORITY_COLORS } from '$lib/ui/tones';
import type { PickOption } from '$lib/ui/types';
import { formatDueDate } from '../format';
import { dueChoices } from './due-choices';
import { featureColors } from './feature-colors';
import type { TaskCardView } from './task-card';

/** Features one can still attach work to (plus the current one, even if put away). */
export function featureOptions(features: Feature[], activeId: string | null) {
	const colorOf = featureColors(features);
	return [
		...features
			.filter((f) => (!isArchived(f) && f.priority !== 'wont') || f.id === activeId)
			.map((f) => ({
				...{ value: f.id as string | null, label: f.title, square: colorOf(f.id) },
				active: f.id === activeId
			})),
		{ value: null, label: 'Aucune, c’est à part', icon: X, active: activeId === null }
	];
}

export const peopleOptions = (members: Member[], meId: string, activeIds: string[]) =>
	members.map((m) => ({
		...{ value: m.id, label: m.id === meId ? `${m.name} (moi)` : m.name, person: m },
		active: activeIds.includes(m.id)
	}));

export const dueOptions = (active: string | null): PickOption<string | null>[] =>
	dueChoices(new Date()).map((d) => ({
		...{ value: d.value, label: d.value ? d.label : 'Aucune échéance' },
		hint: d.value ? formatDueDate(d.value) : undefined,
		active: d.value === active
	}));

export const statusOptions = (active: TaskStatus): PickOption<TaskStatus>[] =>
	TASK_STATUSES.map((s) => ({
		value: s,
		label: STATUS_LABELS[s],
		status: s,
		active: s === active
	}));

export const priorityOptions = (active: Moscow): PickOption<Moscow>[] =>
	MOSCOW.map((p) => ({
		...{ value: p, label: MOSCOW_LABELS[p], hint: MOSCOW_HINTS[p].split(' · ')[0] },
		...{ dot: PRIORITY_COLORS[p], active: p === active }
	}));

export interface TaskMenus {
	feature: PickOption<string | null>[];
	people: PickOption<string>[];
	due: PickOption<string | null>[];
}

/** The click menus of a task row: each option says whether it is the current value. */
export const taskMenus = (
	task: TaskCardView,
	features: Feature[],
	members: Member[],
	meId: string
): TaskMenus => ({
	feature: featureOptions(features, task.feature?.id ?? null),
	people: peopleOptions(
		members,
		meId,
		task.assignees.map((a) => a.id)
	),
	due: dueOptions(task.dueDate)
});
