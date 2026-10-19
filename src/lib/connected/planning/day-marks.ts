import { dayKey } from '$lib/modules/planning/domain/calendar';
import { toDateKey } from '$lib/modules/kernel/domain/dates';
import type { Project } from '$lib/modules/projects/domain/project';
import type { Milestone } from '$lib/modules/roadmap/domain/milestone';
import type { Release } from '$lib/modules/roadmap/domain/release';
import type { Task } from '$lib/modules/tasks/domain/task';
import type { DayMark } from '$lib/ui/organisms/agenda/types';

interface Sources {
	tasks: Task[];
	milestones: Milestone[];
	releases: Release[];
	project: Project;
	/** Only these people's finished tasks (« Moi » or the whole team). */
	people: { id: string; name: string; colorIndex: number }[];
	color: string;
	today: string;
}

/**
 * Above each day: the delivery date, the end of a step, a version shipped, what is due that day,
 * and what was finished (and by whom).
 */
export function dayMarks(
	days: Date[],
	{ tasks, milestones, releases, project, people, color, today }: Sources
): DayMark[][] {
	const byId = new Map(people.map((p) => [p.id, p]));
	return days.map((day) => {
		const key = dayKey(day);
		const late = key < today;
		const delivery: DayMark[] =
			project.deadline === key
				? [
						{
							id: 'delivery',
							ref: '',
							kind: 'step',
							title: 'Livraison du projet',
							color: 'var(--now)',
							late
						}
					]
				: [];
		const steps: DayMark[] = milestones
			.filter((m) => !m.closedAt && m.targetDate === key)
			.map((m) => ({
				id: `step-${m.id}`,
				ref: m.id,
				kind: 'step',
				title: `Fin : ${m.title}`,
				color: 'var(--plan)',
				late
			}));
		const shipped: DayMark[] = releases
			.filter((r) => toDateKey(new Date(r.shippedAt)) === key)
			.map((r) => ({
				id: `release-${r.id}`,
				ref: r.id,
				kind: 'release',
				title: `${r.name} en prod`,
				color: 'var(--ok)',
				late: false
			}));
		const due: DayMark[] = tasks
			.filter((t) => t.status !== 'done' && t.status !== 'idea' && t.dueDate === key)
			.map((t) => ({
				id: `due-${t.id}`,
				ref: t.id,
				kind: 'due',
				title: t.title,
				color,
				late
			}));
		const done: DayMark[] = tasks
			.filter(
				(t) =>
					t.completedAt &&
					toDateKey(new Date(t.completedAt)) === key &&
					(!t.assigneeId || byId.has(t.assigneeId))
			)
			.map((t) => ({
				id: `done-${t.id}`,
				ref: t.id,
				kind: 'done',
				title: t.title,
				color: 'var(--ok)',
				late: false,
				person: t.assigneeId ? byId.get(t.assigneeId) : undefined
			}));
		return [...delivery, ...steps, ...shipped, ...due, ...done];
	});
}
