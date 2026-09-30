import { BookOpen, Lightbulb, Plus, SunMoon } from '@lucide/svelte';
import type { ElementSummary } from '$lib/modules/kernel/domain/element';
import type { PaletteGroup, PaletteItem } from '$lib/ui/types';
import { NAVIGATION } from './navigation';
import { KIND_META } from './refs/kinds';
import { searchElements } from './refs/search';

export interface PaletteIntents {
	createTask: (title: string) => void;
	createIdea: (title: string) => void;
	createDecision: (title: string) => void;
	open: (element: ElementSummary) => void;
	navigate: (path: string) => void;
	toggleTheme: () => void;
}

const matches = (label: string, query: string) => label.toLowerCase().includes(query.toLowerCase());

function createItems(query: string, intents: PaletteIntents): PaletteItem[] {
	if (!query) return [];
	return [
		{ id: 'new-task', label: `Nouvelle tâche « ${query} »`, icon: Plus, run: () => intents.createTask(query) },
		{ id: 'new-idea', label: `Nouvelle idée « ${query} »`, icon: Lightbulb, run: () => intents.createIdea(query) },
		{ id: 'new-decision', label: `Tracer une décision « ${query} »`, icon: BookOpen, run: () => intents.createDecision(query) }
	];
}

/** Everything Cmd+K can do for a query: create, jump to an element, go to a page, act. */
export function paletteGroups(query: string, elements: ElementSummary[], intents: PaletteIntents): PaletteGroup[] {
	const found = searchElements(elements.filter((element) => !element.id.startsWith('draft-')), query, query ? 8 : 5);
	return [
		{ label: 'Créer', items: createItems(query, intents) },
		{
			label: 'Éléments',
			items: found.map((element) => ({ id: element.id, label: element.title, hint: element.ref, icon: KIND_META[element.kind].icon, run: () => intents.open(element) }))
		},
		{
			label: 'Aller à',
			items: NAVIGATION.filter((item) => matches(item.label, query)).map((item) => ({ id: item.key, label: item.label, icon: item.icon, hint: item.shortcut.toUpperCase(), run: () => intents.navigate(item.path) }))
		},
		{
			label: 'Actions',
			items: [{ id: 'theme', label: 'Changer de thème', icon: SunMoon, run: intents.toggleTheme }].filter((item) => matches(item.label, query))
		}
	];
}
