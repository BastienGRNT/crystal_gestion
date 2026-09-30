import type { Activity } from './activity';

const COLLAPSE_WINDOW_MS = 30 * 60 * 1000;

/**
 * Successive edits of the same element by the same person within half an hour read as one line:
 * the feed stays about what moved, not about every keystroke. Input and output are newest first.
 */
export function collapseActivity(activities: Activity[]): Activity[] {
	const kept: Activity[] = [];
	for (const activity of activities) {
		const previous = kept.at(-1);
		const sameEdit =
			previous &&
			activity.verb === 'updated' &&
			previous.actorId === activity.actorId &&
			previous.elementRef === activity.elementRef &&
			Date.parse(previous.createdAt) - Date.parse(activity.createdAt) < COLLAPSE_WINDOW_MS;
		if (!sameEdit) kept.push(activity);
	}
	return kept;
}
