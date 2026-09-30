import type { ElementSummary } from '$lib/modules/kernel/domain/element';

const normalize = (value: string) => value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Ref prefix matches first (typing "T-1"), then title matches, most recent first. */
export function searchElements(
	elements: ElementSummary[],
	query: string,
	limit = 8
): ElementSummary[] {
	const q = normalize(query.trim());
	if (!q)
		return [...elements].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
	const score = (element: ElementSummary) => {
		if (normalize(element.ref) === q) return 0;
		if (normalize(element.ref).startsWith(q)) return 1;
		if (normalize(element.title).startsWith(q)) return 2;
		return normalize(element.title).includes(q) ? 3 : -1;
	};
	return elements
		.map((element) => ({ element, score: score(element) }))
		.filter(({ score }) => score >= 0)
		.sort((a, b) => a.score - b.score || b.element.createdAt.localeCompare(a.element.createdAt))
		.slice(0, limit)
		.map(({ element }) => element);
}
