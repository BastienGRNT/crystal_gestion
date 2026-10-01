import {
	BookOpen,
	CalendarDays,
	ClipboardCheck,
	FolderOpen,
	Gem,
	House,
	KeyRound,
	LayoutList,
	MessagesSquare,
	Sparkles
} from '@lucide/svelte';
import type { NavEntry } from '$lib/ui/types';

/** The sidebar, in order: its position is the keyboard shortcut (1–6). `hint` describes the page in Cmd+K. */
export const NAVIGATION = [
	{
		key: 'today',
		label: 'Accueil',
		path: '',
		icon: House,
		hint: 'Reprendre le fil : qui t’a parlé, où tu en étais, quoi faire'
	},
	{
		key: 'tasks',
		label: 'Gestion',
		path: '/tasks',
		icon: LayoutList,
		hint: 'Feats, Tasks, Fix, Icebox et idées : en liste, tableau ou matrice'
	},
	{
		key: 'discussion',
		label: 'Discussion',
		path: '/discussion',
		icon: MessagesSquare,
		hint: 'Général, ses canaux, et un fil par Feat'
	},
	{
		key: 'planning',
		label: 'Planning',
		path: '/planning',
		icon: CalendarDays,
		hint: 'Dispos, temps passé, échéances et ce qui a été fini'
	},
	{
		key: 'drive',
		label: 'Drive',
		path: '/drive',
		icon: FolderOpen,
		hint: 'Les fichiers du projet et de chaque Feat, en dossiers'
	},
	{
		key: 'resources',
		label: 'Ressources',
		path: '/resources',
		icon: KeyRound,
		hint: 'Comptes partagés, liens et contacts'
	}
] as const;

export type NavKey = (typeof NAVIGATION)[number]['key'];

/** Pages reached from a menu or a button, found by Cmd+K and lighting up their parent entry. */
export const SUB_PAGES = [
	{ key: 'features', parent: 'tasks', label: 'Feats', path: '/features', icon: Gem },
	{ key: 'project', parent: 'today', label: 'Le projet', path: '/project', icon: Gem },
	{
		key: 'journal',
		parent: 'today',
		label: 'Journal des décisions',
		path: '/journal',
		icon: BookOpen
	},
	{ key: 'ai', parent: 'today', label: 'Mémoire IA', path: '/ai', icon: Sparkles },
	{ key: 'review', parent: 'today', label: 'Faire le point', path: '/review', icon: ClipboardCheck }
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

export function activeNav(pathname: string, slug: string): string {
	const rest = pathname.slice(projectPath(slug).length);
	const sub = SUB_PAGES.find((page) => rest.startsWith(page.path));
	if (sub) return sub.key;
	return NAVIGATION.find((item) => item.path && rest.startsWith(item.path))?.key ?? 'today';
}

export const navItem = (key: NavKey) => NAVIGATION.find((item) => item.key === key)!;
