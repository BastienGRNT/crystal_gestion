import { dayKey } from '$lib/modules/planning/domain/calendar';
import { daysUntil, toDateKey } from '$lib/modules/kernel/domain/dates';
import type { Task } from '$lib/modules/tasks/domain/task';
import type { DayMark } from '$lib/ui/organisms/agenda/types';

interface Sources {
	tasks: Task[];
	/** Only these people's tasks (« Moi » or the whole team). */
	people: { id: string; name: string; color: string }[];
	colorOf: (featureId: string | null) => string;
	today: Date;
}

/** Above each day: what is due that day (planned end) and what was finished, and by whom. */
export function dayMarks(days: Date[], { tasks, people, colorOf, today }: Sources): DayMark[][] {
	const byId = new Map(people.map((p) => [p.id, p]));
	const theirs = tasks.filter((t) => t.assigneeIds.some((id) => byId.has(id)));
	return days.map((day) => {
		const key = dayKey(day);
		const due: DayMark[] = theirs
			.filter((t) => t.status !== 'done' && t.status !== 'icebox' && t.dueDate === key)
			.map((t) => ({
				...{ id: `due-${t.id}`, ref: t.ref, kind: 'due', title: t.title },
				...{ color: colorOf(t.featureId), late: daysUntil(key, today) < 0 }
			}));
		const done: DayMark[] = theirs
			.filter((t) => t.completedAt && toDateKey(new Date(t.completedAt)) === key)
			.map((t) => ({
				...{ id: `done-${t.id}`, ref: t.ref, kind: 'done', title: t.title },
				...{ color: colorOf(t.featureId), late: false, person: byId.get(t.assigneeIds[0]) }
			}));
		return [...due, ...done];
	});
}
