import { dayKey } from '$lib/modules/planning/domain/calendar';
import { toDateKey } from '$lib/modules/kernel/domain/dates';
import type { Project } from '$lib/modules/projects/domain/project';
import type { Task } from '$lib/modules/tasks/domain/task';
import type { DayMark } from '$lib/ui/organisms/agenda/types';

interface Sources {
	tasks: Task[];
	project: Project;
	/** Only these people's finished tasks (« Moi » or the whole team). */
	people: { id: string; name: string; colorIndex: number }[];
	color: string;
	today: string;
}

/** Above each day: the delivery date, what is due that day, and what was finished (and by whom). */
export function dayMarks(
	days: Date[],
	{ tasks, project, people, color, today }: Sources
): DayMark[][] {
	const byId = new Map(people.map((p) => [p.id, p]));
	return days.map((day) => {
		const key = dayKey(day);
		const delivery: DayMark[] =
			project.deadline === key
				? [
						{
							id: 'delivery',
							ref: '',
							kind: 'due',
							title: 'Livraison du projet',
							color: 'var(--now)',
							late: key < today
						}
					]
				: [];
		const due: DayMark[] = tasks
			.filter((t) => t.status !== 'done' && t.status !== 'idea' && t.dueDate === key)
			.map((t) => ({
				id: `due-${t.id}`,
				ref: t.id,
				kind: 'due',
				title: t.title,
				color,
				late: key < today
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
		return [...delivery, ...due, ...done];
	});
}
