import {
	BookOpen,
	CalendarDays,
	ClipboardCheck,
	Gem,
	House,
	KeyRound,
	Layers,
	Lightbulb,
	MessagesSquare,
	Sparkles,
	SquareCheckBig
} from '@lucide/svelte';
import type { NavEntry } from '$lib/ui/types';

/** The sidebar, in order: its position is the keyboard shortcut (1–7). `hint` describes the page in Cmd+K. */
export const NAVIGATION = [
	{
		key: 'today',
		label: 'Aujourd’hui',
		path: '',
		icon: House,
		hint: 'Tes tâches du jour, tes dispos et ce qui a bougé'
	},
	{
		key: 'tasks',
		label: 'Tâches',
		path: '/tasks',
		icon: SquareCheckBig,
		hint: 'Qui fait quoi, et dans quel ordre'
	},
	{
		key: 'features',
		label: 'Features',
		path: '/features',
		icon: Layers,
		hint: 'Les morceaux du produit, le journal et le cadrage du projet'
	},
	{
		key: 'discussion',
		label: 'Discussion',
		path: '/discussion',
		icon: MessagesSquare,
		hint: 'Échanger, poser une question à quelqu’un'
	},
	{
		key: 'planning',
		label: 'Planning',
		path: '/planning',
		icon: CalendarDays,
		hint: 'Quand chacun est dispo, et le temps passé'
	},
	{
		key: 'resources',
		label: 'Ressources',
		path: '/resources',
		icon: KeyRound,
		hint: 'Comptes partagés, liens, contacts et fichiers'
	},
	{
		key: 'ideas',
		label: 'Idées',
		path: '/ideas',
		icon: Lightbulb,
		hint: 'Tout ce qui attend d’être trié'
	}
] as const;

export type NavKey = (typeof NAVIGATION)[number]['key'];

/** Pages reached from a tab or a button, found by Cmd+K and lighting up their parent entry. */
export const SUB_PAGES = [
	{ key: 'journal', parent: 'features', label: 'Journal', path: '/journal', icon: BookOpen },
	{ key: 'project', parent: 'features', label: 'Le projet', path: '/project', icon: Gem },
	{ key: 'ai', parent: 'features', label: 'Mémoire IA', path: '/ai', icon: Sparkles },
	{
		key: 'review',
		parent: 'ideas',
		label: 'Revue de la semaine',
		path: '/review',
		icon: ClipboardCheck
	}
] as const;

export const projectPath = (slug: string, path = '') => `/p/${slug}${path}`;

export const navEntries = (
	slug: string,
	badges: Partial<Record<NavKey, number>> = {}
): NavEntry[] =>
	NAVIGATION.map((item, index) => ({
		...{ key: item.key, label: item.label, icon: item.icon, shortcut: String(index + 1) },
		href: projectPath(slug, item.path),
		badge: badges[item.key] ?? 0
	}));

export function activeNav(pathname: string, slug: string): NavKey {
	const rest = pathname.slice(projectPath(slug).length);
	const sub = SUB_PAGES.find((page) => rest.startsWith(page.path));
	if (sub) return sub.parent;
	return NAVIGATION.find((item) => item.path && rest.startsWith(item.path))?.key ?? 'today';
}

export const navItem = (key: NavKey) => NAVIGATION.find((item) => item.key === key)!;
