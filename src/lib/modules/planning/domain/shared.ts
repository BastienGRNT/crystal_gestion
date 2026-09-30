/** Time ranges during which at least `minimum` different people are available at once (contiguous ones merged). */
export function sharedRanges(
	spans: { owner: string; start: number; end: number }[],
	minimum = 2
): { start: number; end: number; owners: string[] }[] {
	const points = [...new Set(spans.flatMap((span) => [span.start, span.end]))].sort(
		(a, b) => a - b
	);
	const ranges: { start: number; end: number; owners: string[] }[] = [];
	for (let i = 0; i < points.length - 1; i++) {
		const [start, end] = [points[i], points[i + 1]];
		const owners = [
			...new Set(spans.filter((s) => s.start <= start && s.end >= end).map((s) => s.owner))
		].sort();
		if (owners.length < minimum) continue;
		const last = ranges.at(-1);
		if (last?.end !== start) ranges.push({ start, end, owners });
		else Object.assign(last, { end, owners: [...new Set([...last.owners, ...owners])].sort() });
	}
	return ranges;
}
