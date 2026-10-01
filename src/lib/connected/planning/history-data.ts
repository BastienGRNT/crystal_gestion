import { formatDay } from '$lib/client/format';
import type { Period } from '$lib/modules/planning/domain/history';
import { entriesIn, inPeriod, ranked, weeklyTotals } from '$lib/modules/planning/domain/history';
import type { Feature } from '$lib/modules/features/domain/feature';
import type { Member } from '$lib/modules/projects/domain/project';
import type { Task } from '$lib/modules/tasks/domain/task';
import {
	formatMinutes,
	minutesBy,
	totalMinutes,
	type TimeEntry
} from '$lib/modules/time/domain/time-entry';
import type { BarRow, DoneTask, WeekBar } from '$lib/ui/organisms/history/types';

interface Source {
	period: Period;
	offset: number;
	now: Date;
	entries: TimeEntry[];
	members: Member[];
	tasks: Task[];
	features: Feature[];
}

const short = { day: 'numeric', month: 'short' } as const;

/** Everything the history tab draws for one week. */
export function historyData(s: Source) {
	const entries = entriesIn(s.entries, s.period);
	const task = (id: string | null) => s.tasks.find((t) => t.id === id);
	const featureOf = (id: string | null) => s.features.find((f) => f.id === task(id)?.featureId);
	const row = (key: string, label: string, minutes: number, color?: string): BarRow => ({
		...{ key, label, minutes, color },
		value: formatMinutes(minutes)
	});
	const people = ranked(minutesBy(entries, (e) => e.userId, s.now)).map(({ key, minutes }) => {
		const member = s.members.find((m) => m.id === key);
		return row(key, member?.name ?? 'Ancien membre', minutes, member?.color);
	});
	const byFeature = minutesBy(entries, (e) => featureOf(e.taskId)?.id ?? '', s.now);
	const features = ranked(byFeature).map(({ key, minutes }) =>
		row(key || 'none', s.features.find((f) => f.id === key)?.title ?? 'Sans Feat', minutes)
	);
	const weeks: WeekBar[] = weeklyTotals(s.entries, s.now, s.offset, 8).map((week, index) => ({
		...{ key: week.from.toISOString(), label: formatDay(week.from, short), minutes: week.minutes },
		...{ value: formatMinutes(week.minutes), current: index === 7 }
	}));
	const done: DoneTask[] = s.tasks
		.filter((t) => inPeriod(t.completedAt, s.period))
		.sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''))
		.map((t) => ({
			...t,
			when: formatDay(t.completedAt!, { weekday: 'short', ...short }),
			feature: featureOf(t.id)?.title ?? null
		}));
	return { total: formatMinutes(totalMinutes(entries, s.now)), people, features, weeks, done };
}
