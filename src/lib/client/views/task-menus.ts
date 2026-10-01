import { X } from '@lucide/svelte';
import type { Feature } from '$lib/modules/features/domain/feature';
import type { Member } from '$lib/modules/projects/domain/project';
import { STATUS_LABELS, TASK_STATUSES, type TaskStatus } from '$lib/modules/tasks/domain/task';
import { PRIORITY_COLORS, STATUS_COLORS } from '$lib/ui/tones';
import type { PickOption } from '$lib/ui/types';
import type { TaskCardView } from './task-card';
import { dueChoices } from './due-choices';
import { formatDueDate } from '../format';

export interface TaskMenus {
	feature: PickOption<string | null>[];
	status: PickOption<TaskStatus>[];
	people: PickOption<string>[];
	due: PickOption<string | null>[];
}

/** The click menus of a task row: each option says whether it is the current value. */
export function taskMenus(
	task: TaskCardView,
	features: Feature[],
	members: Member[],
	meId: string
): TaskMenus {
	const assigned = new Set(task.assignees.map((a) => a.id));
	return {
		feature: [
			...features
				.filter((f) => f.priority !== 'wont' || f.id === task.feature?.id)
				.map((f) => ({
					...{ value: f.id, label: f.title, hint: f.ref, dot: PRIORITY_COLORS[f.priority] },
					active: f.id === task.feature?.id
				})),
			{ value: null, label: 'Sans feature', icon: X, active: !task.feature }
		],
		status: TASK_STATUSES.map((s) => ({
			...{ value: s, label: STATUS_LABELS[s], dot: STATUS_COLORS[s] },
			active: s === task.status
		})),
		people: members.map((m) => ({
			...{ value: m.id, label: m.id === meId ? `${m.name} (moi)` : m.name, person: m },
			active: assigned.has(m.id)
		})),
		due: dueChoices(new Date()).map((d) => ({
			...{ value: d.value, label: d.value ? d.label : 'Aucune échéance' },
			hint: d.value ? formatDueDate(d.value) : undefined,
			active: d.value === task.dueDate
		}))
	};
}
