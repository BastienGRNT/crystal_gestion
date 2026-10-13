export interface Span {
	id: string;
	start: number;
	end: number;
}

export interface Placement {
	column: number;
	columns: number;
}

/** Places overlapping spans side by side; each cluster of overlaps shares its column count. */
export function layoutColumns(spans: Span[]): Map<string, Placement> {
	const sorted = [...spans].sort((a, b) => a.start - b.start || b.end - a.end);
	const placements = new Map<string, Placement>();
	let cluster: { id: string; column: number }[] = [];
	let columnEnds: number[] = [];
	let clusterEnd = -Infinity;
	const close = () => {
		for (const { id, column } of cluster)
			placements.set(id, { column, columns: columnEnds.length });
		cluster = [];
		columnEnds = [];
	};
	for (const span of sorted) {
		if (span.start >= clusterEnd) close();
		clusterEnd = cluster.length ? Math.max(clusterEnd, span.end) : span.end;
		let column = columnEnds.findIndex((end) => end <= span.start);
		if (column === -1) column = columnEnds.push(span.end) - 1;
		else columnEnds[column] = span.end;
		cluster.push({ id: span.id, column });
	}
	close();
	return placements;
}

/** Lays out each group (e.g. one day of one person) independently, writing column/columns on the spans. */
export function layoutGroups<T extends Span & Placement>(spans: T[], groupOf: (span: T) => string) {
	for (const group of Map.groupBy(spans, groupOf).values()) {
		const placements = layoutColumns(group);
		for (const span of group) Object.assign(span, placements.get(span.id));
	}
	return spans;
}
