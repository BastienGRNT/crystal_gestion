import type { JournalKind } from '$lib/modules/journal/domain/journal-entry';

/** One color per kind, shared by badges and timeline markers so the eye links them. */
export const KIND_STYLE: Record<JournalKind, { badge: string; dot: string }> = {
	decision: { badge: 'bg-accent-soft text-accent', dot: 'bg-accent' },
	fix: { badge: 'bg-success/12 text-success', dot: 'bg-success' },
	scope: { badge: 'bg-sunken text-ink-2', dot: 'bg-wont' }
};
