import type { Moscow } from '$lib/modules/features/domain/feature';
import type { TaskStatus } from '$lib/modules/tasks/domain/task';

/** Marker colors (CSS values) shared by dots, pills and menus. */
export const PRIORITY_COLORS: Record<Moscow, string> = {
	must: 'var(--must)',
	should: 'var(--should)',
	could: 'var(--could)',
	wont: 'var(--wont)'
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
	icebox: 'var(--line-strong)',
	todo: 'var(--ink-3)',
	in_progress: 'var(--should)',
	review: 'var(--accent)',
	done: 'var(--success)'
};

/** Same hue, washed out: the background of a status or priority pill. */
export const soft = (color: string, percent = 14) =>
	`color-mix(in oklch, ${color} ${percent}%, transparent)`;
