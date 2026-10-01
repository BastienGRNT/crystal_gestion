import type { Quadrant } from '$lib/modules/tasks/domain/eisenhower';

export const QUADRANT_HINTS: Record<Quadrant, string> = {
	do: 'Important et urgent',
	plan: 'Important, pas urgent',
	ifTime: 'Urgent, moins important',
	later: 'Ni urgent ni important'
};

export const QUADRANT_COLORS: Record<Quadrant, string> = {
	do: 'var(--must)',
	plan: 'var(--accent)',
	ifTime: 'var(--should)',
	later: 'var(--wont)'
};

/** What to do with each quadrant, written inside the matrix (the axes already say why). */
export const QUADRANT_ACTIONS: Record<Quadrant, string> = {
	do: 'À faire en priorité',
	plan: 'À planifier',
	ifTime: 'À caser vite, ou à déléguer',
	later: 'Peut attendre, ou à abandonner'
};
