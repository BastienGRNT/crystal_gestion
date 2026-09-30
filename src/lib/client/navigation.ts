import {
	CalendarDays,
	ClipboardCheck,
	Gem,
	Library,
	Lightbulb,
	MessagesSquare,
	SquareCheckBig,
	Sun
} from '@lucide/svelte';
import type { NavSection } from '$lib/ui/types';

/** Every page of a project. `hint` answers "what do I do here?" in the header and Cmd+K. */
export const NAVIGATION = [
	{
		key: 'today',
		group: 'daily',
		label: 'Aujourd’hui',
		path: '',
		icon: Sun,
		shortcut: 'g a',
		hint: 'Tes tâches du jour, tes dispos et ce qui a bougé'
	},
	{
		key: 'tasks',
		group: 'daily',
		label: 'Tâches',
		path: '/tasks',
		icon: SquareCheckBig,
		shortcut: 'g t',
		hint: 'Qui fait quoi, et dans quel ordre'
	},
	{
		key: 'discussion',
		group: 'daily',
		label: 'Discussion',
		path: '/discussion',
		icon: MessagesSquare,
		shortcut: 'g d',
		hint: 'Échanger, poser une question à quelqu’un'
	},
	{
		key: 'planning',
		group: 'daily',
		label: 'Planning',
		path: '/planning',
		icon: CalendarDays,
		shortcut: 'g l',
		hint: 'Quand chacun est dispo, et le temps passé'
	},
	{
		key: 'project',
		group: 'project',
		label: 'Projet',
		path: '/project',
		icon: Gem,
		shortcut: 'g p',
		hint: 'Objectif, features, équipe, journal des décisions'
	},
	{
		key: 'resources',
		group: 'project',
		label: 'Ressources',
		path: '/resources',
		icon: Library,
		shortcut: 'g r',
		hint: 'Comptes partagés, liens, contacts et fichiers'
	},
	{
		key: 'ideas',
		group: 'weekly',
		label: 'Idées',
		path: '/ideas',
		icon: Lightbulb,
		shortcut: 'g i',
		hint: 'Tout ce qui attend : à trier pendant la revue'
	},
	{
		key: 'review',
		group: 'weekly',
		label: 'Revue de la semaine',
		path: '/review',
		icon: ClipboardCheck,
		shortcut: 'g v',
		hint: '10 minutes pour faire le point ensemble'
	}
] as const;

export type NavKey = (typeof NAVIGATION)[number]['key'];

const GROUPS = [
	{ key: 'daily', label: 'Au quotidien' },
	{ key: 'project', label: 'Le projet' },
	{ key: 'weekly', label: 'Chaque semaine' }
] as const;

/** Pages reached from inside another one (tabs, links) light up their parent entry. */
const CHILDREN: Record<string, NavKey> = {
	'/journal': 'project',
	'/ai': 'project',
	'/features': 'project'
};

export const projectPath = (slug: string, path = '') => `/p/${slug}${path}`;

export const navSections = (
	slug: string,
	badges: Partial<Record<NavKey, number>> = {}
): NavSection[] =>
	GROUPS.map((group) => ({
		label: group.label,
		items: NAVIGATION.filter((item) => item.group === group.key).map((item) => ({
			...{ key: item.key, label: item.label, icon: item.icon, shortcut: item.shortcut },
			href: projectPath(slug, item.path),
			badge: badges[item.key] ?? 0
		}))
	}));

export function activeNav(pathname: string, slug: string): NavKey {
	const rest = pathname.slice(projectPath(slug).length);
	const child = Object.entries(CHILDREN).find(([path]) => rest.startsWith(path));
	if (child) return child[1];
	return NAVIGATION.find((item) => item.path && rest.startsWith(item.path))?.key ?? 'today';
}

export const navItem = (key: NavKey) => NAVIGATION.find((item) => item.key === key)!;
