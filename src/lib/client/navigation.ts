import {
	BookOpen,
	CalendarDays,
	ClipboardCheck,
	Gem,
	Library,
	Lightbulb,
	MessagesSquare,
	SquareCheckBig,
	Sun
} from '@lucide/svelte';

export const NAVIGATION = [
	{ key: 'today', label: 'Aujourd’hui', path: '', icon: Sun, shortcut: 'g a' },
	{ key: 'project', label: 'Projet', path: '/project', icon: Gem, shortcut: 'g p' },
	{ key: 'tasks', label: 'Tâches', path: '/tasks', icon: SquareCheckBig, shortcut: 'g t' },
	{
		key: 'discussion',
		label: 'Discussion',
		path: '/discussion',
		icon: MessagesSquare,
		shortcut: 'g d'
	},
	{ key: 'journal', label: 'Journal', path: '/journal', icon: BookOpen, shortcut: 'g j' },
	{ key: 'ideas', label: 'Idées', path: '/ideas', icon: Lightbulb, shortcut: 'g i' },
	{ key: 'planning', label: 'Planning', path: '/planning', icon: CalendarDays, shortcut: 'g l' },
	{ key: 'resources', label: 'Ressources', path: '/resources', icon: Library, shortcut: 'g r' },
	{ key: 'review', label: 'Revue', path: '/review', icon: ClipboardCheck, shortcut: 'g v' }
] as const;

export type NavKey = (typeof NAVIGATION)[number]['key'];

export const projectPath = (slug: string, path = '') => `/p/${slug}${path}`;

export function activeNav(pathname: string, slug: string): NavKey {
	const rest = pathname.slice(projectPath(slug).length);
	const found = NAVIGATION.find((item) => item.path && rest.startsWith(item.path));
	if (rest.startsWith('/features')) return 'project';
	return found?.key ?? 'today';
}
