import type { Quadrant } from '$lib/modules/tasks/domain/eisenhower';

export const QUADRANT_HINTS: Record<Quadrant, string> = {
	do: 'Important et urgent',
	plan: 'Important, pas urgent',
	ifTime: 'Urgent, moins important',
	later: 'Ni urgent ni important'
};

export const QUADRANT_TONES: Record<Quadrant, string> = {
	do: 'bg-must',
	plan: 'bg-accent',
	ifTime: 'bg-should',
	later: 'bg-wont'
};

export const QUADRANT_COLORS: Record<Quadrant, string> = {
	do: 'var(--must)',
	plan: 'var(--accent)',
	ifTime: 'var(--should)',
	later: 'var(--wont)'
};
