export const fold = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/**
 * Every word of the query must appear; words starting the text or a word of it rank higher.
 * Accents and case never matter: "deploiement" finds "Déploiement".
 */
export function score(haystack: string, query: string): number | null {
	const words = fold(query).split(/\s+/).filter(Boolean);
	if (!words.length) return 0;
	const text = fold(haystack);
	let total = 0;
	for (const word of words) {
		const at = text.indexOf(word);
		if (at < 0) return null;
		total += at === 0 ? 3 : /[\s\-_./#]/.test(text[at - 1]) ? 2 : 1;
	}
	return total;
}

export interface Searchable {
	group: string;
	keywords: string;
}

/** Best matches first, a few per group so one kind never hides the others. */
export function rank<T extends Searchable>(items: T[], query: string, perGroup = 5): T[] {
	const scored = items
		.map((item, order) => ({ item, order, score: score(item.keywords, query) }))
		.filter((entry) => entry.score !== null)
		.sort((a, b) => b.score! - a.score! || a.order - b.order);
	const counts = new Map<string, number>();
	const kept = scored.filter(({ item }) => {
		const count = counts.get(item.group) ?? 0;
		counts.set(item.group, count + 1);
		return count < perGroup;
	});
	const groups = [...new Set(items.map((item) => item.group))];
	return groups.flatMap((group) => kept.filter((e) => e.item.group === group).map((e) => e.item));
}
