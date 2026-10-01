import type { ProjectStore } from '$lib/client/project-store.svelte';
import { featureColors } from '$lib/client/views/feature-colors';
import { featureToken, fold } from '$lib/client/views/quick-entry';
import { isArchived } from '$lib/modules/features/domain/feature';
import type { TokenSuggestion } from '$lib/ui/types';

/** `@` completes a teammate, `#` a feature in progress. */
export function tokenSuggestions(
	store: ProjectStore,
	sigil: '@' | '#',
	word: string
): TokenSuggestion[] {
	const query = fold(word);
	if (sigil === '@')
		return store.members.items
			.filter((m) => fold(m.name).startsWith(query))
			.map((m) => ({ label: m.name, insert: m.name.split(' ')[0], person: m }));
	const colorOf = featureColors(store.features.items);
	const open = store.features.items.filter((f) => !isArchived(f));
	return open
		.filter((f) => fold(f.title).includes(query))
		.map((f) => ({ label: f.title, insert: featureToken(f, open), square: colorOf(f.id) }));
}
