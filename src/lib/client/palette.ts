import { SunMoon } from '@lucide/svelte';
import type { ElementSummary } from '$lib/modules/kernel/domain/element';
import type { PaletteGroup, PaletteItem } from '$lib/ui/types';
import { CREATE_KINDS, type CreateKind } from './create-kinds';
import { DESTINATIONS, matchesWords } from './destinations';
import { NAVIGATION, SUB_PAGES } from './navigation';
import { KIND_META } from './refs/kinds';
import { searchElements } from './refs/search';

export interface PaletteIntents {
	create: (kind: CreateKind, title: string) => void;
	open: (element: ElementSummary) => void;
	navigate: (path: string) => void;
	toggleTheme: () => void;
}

function createItems(query: string, intents: PaletteIntents): PaletteItem[] {
	if (!query) return [];
	return CREATE_KINDS.filter((kind) => kind.value !== 'fix').map((kind) => ({
		id: `new-${kind.value}`,
		label: `${kind.label} « ${query} »`,
		hint: kind.key,
		icon: kind.icon,
		run: () => intents.create(kind.value, query)
	}));
}

/** Everything Cmd+K can do for a query: create, jump to an element, go to a page, act. */
const pageItems = (query: string, intents: PaletteIntents): PaletteItem[] => [
	...NAVIGATION.filter((item) => matchesWords(query, item.label, item.hint)).map((item, i) => ({
		...{ id: item.key, label: item.label, detail: item.hint, icon: item.icon },
		hint: String(i + 1),
		run: () => intents.navigate(item.path)
	})),
	...SUB_PAGES.filter((page) => query && matchesWords(query, page.label)).map((page) => ({
		...{ id: page.key, label: page.label, icon: page.icon },
		run: () => intents.navigate(page.path)
	}))
];

const destinationItems = (query: string, intents: PaletteIntents): PaletteItem[] =>
	query
		? DESTINATIONS.filter((d) => matchesWords(query, d.label, d.keywords)).map((d) => ({
				...{ id: d.id, label: d.label, icon: d.icon },
				run: () => intents.navigate(d.path)
			}))
		: [];

/** Everything Cmd+K can do for a query: jump to an element, a key piece of info or a page, act, create. */
export function paletteGroups(
	query: string,
	elements: ElementSummary[],
	intents: PaletteIntents
): PaletteGroup[] {
	const found = searchElements(
		elements.filter((element) => !element.id.startsWith('draft-')),
		query,
		query ? 8 : 5
	);
	const actions = [
		{ id: 'theme', label: 'Changer de thème', icon: SunMoon, run: intents.toggleTheme }
	];
	return [
		{
			label: query ? 'Éléments' : 'Récents',
			items: found.map((element) => ({
				...{ id: element.id, label: element.title, hint: element.ref },
				icon: KIND_META[element.kind].icon,
				run: () => intents.open(element)
			}))
		},
		{ label: 'Infos clés', items: destinationItems(query, intents) },
		{ label: 'Pages', items: pageItems(query, intents) },
		{ label: 'Actions', items: actions.filter((item) => matchesWords(query, item.label)) },
		// Last: Enter must open what the search found, creating is the fallback.
		{ label: 'Créer', items: createItems(query, intents) }
	];
}
