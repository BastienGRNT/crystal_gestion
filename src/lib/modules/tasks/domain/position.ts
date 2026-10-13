/**
 * Fractional ordering: dropping a card between two others only rewrites that card.
 * Doubles leave ~50 halvings in the same gap, far more than two people will ever do by hand.
 */
export function positionBetween(before: number | undefined, after: number | undefined): number {
	if (before === undefined && after === undefined) return 0;
	if (before === undefined) return after! - 1;
	if (after === undefined) return before + 1;
	return (before + after) / 2;
}

/** Position for a card dropped at `index` in a list that does not contain it any more. */
export function positionAt(sortedPositions: number[], index: number): number {
	return positionBetween(sortedPositions[index - 1], sortedPositions[index]);
}

export const positionAtEnd = (sortedPositions: number[]) =>
	positionBetween(sortedPositions.at(-1), undefined);
