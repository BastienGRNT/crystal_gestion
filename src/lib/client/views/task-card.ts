import type { Feature, Moscow } from '$lib/modules/features/domain/feature';
import type { Member } from '$lib/modules/projects/domain/project';
import { daysUntil } from '$lib/modules/kernel/domain/dates';
import { URGENCY_THRESHOLD_DAYS } from '$lib/modules/tasks/domain/eisenhower';
import type { Task } from '$lib/modules/tasks/domain/task';
import { isRunning, totalMinutes, type TimeEntry } from '$lib/modules/time/domain/time-entry';

export interface TaskCardView {
	id: string;
	ref: string;
	title: string;
	done: boolean;
	feature: { ref: string; title: string; priority: Moscow } | null;
	assignees: Pick<Member, 'id' | 'name' | 'color'>[];
	dueDate: string | null;
	dueTone: 'late' | 'soon' | null;
	running: boolean;
	minutes: number;
}

interface Sources {
	featuresById: Map<string, Feature>;
	membersById: Map<string, Member>;
	entries: TimeEntry[];
	today: Date;
}

export function dueTone(
	dueDate: string | null,
	done: boolean,
	today: Date
): TaskCardView['dueTone'] {
	if (!dueDate || done) return null;
	const days = daysUntil(dueDate, today);
	return days < 0 ? 'late' : days <= URGENCY_THRESHOLD_DAYS ? 'soon' : null;
}

export function toTaskCard(
	task: Task,
	{ featuresById, membersById, entries, today }: Sources
): TaskCardView {
	const feature = task.featureId ? featuresById.get(task.featureId) : undefined;
	const own = entries.filter((entry) => entry.taskId === task.id);
	return {
		id: task.id,
		ref: task.ref,
		title: task.title,
		done: task.status === 'done',
		feature: feature
			? { ref: feature.ref, title: feature.title, priority: feature.priority }
			: null,
		assignees: task.assigneeIds
			.map((id) => membersById.get(id))
			.filter((m): m is Member => m !== undefined),
		dueDate: task.dueDate,
		dueTone: dueTone(task.dueDate, task.status === 'done', today),
		running: own.some(isRunning),
		minutes: totalMinutes(own, today)
	};
}
