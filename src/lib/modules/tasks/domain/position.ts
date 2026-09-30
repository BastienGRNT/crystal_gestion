const STEP = 1024;

/** Fractional ordering: moving a card rewrites only that card, so concurrent moves never conflict. */
export function positionBetween(before: number | undefined, after: number | undefined): number {
	if (before === undefined && after === undefined) return STEP;
	if (before === undefined) return after! - STEP;
	if (after === undefined) return before + STEP;
	return (before + after) / 2;
}

export const positionAtEnd = (positions: number[]) =>
	positionBetween(positions.length ? Math.max(...positions) : undefined, undefined);
