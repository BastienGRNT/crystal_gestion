import {
	BookOpen,
	CalendarClock,
	Clock,
	Contact,
	KeyRound,
	Link,
	Paperclip,
	Sparkles,
	Target,
	UserPlus,
	Users
} from '@lucide/svelte';

/** Key information one search away: where it lives, and the words people type to find it. */
export const DESTINATIONS = [
	{
		id: 'objective',
		label: 'Objectif du projet',
		path: '/project',
		icon: Target,
		keywords: 'objectif but cadrage public cible pour qui date limite hors périmètre fini'
	},
	{
		id: 'team',
		label: 'Équipe',
		path: '/project#equipe',
		icon: Users,
		keywords: 'équipe membres qui personnes'
	},
	{
		id: 'invite',
		label: 'Inviter quelqu’un',
		path: '/project#equipe',
		icon: UserPlus,
		keywords: 'inviter invitation lien ajouter membre inscription'
	},
	{
		id: 'journal',
		label: 'Journal des décisions',
		path: '/journal',
		icon: BookOpen,
		keywords: 'journal décisions pourquoi bugs résolus fix périmètre'
	},
	{
		id: 'ai',
		label: 'Mémoire IA',
		path: '/ai',
		icon: Sparkles,
		keywords: 'ia intelligence mémoire notes contexte'
	},
	{
		id: 'availability',
		label: 'Dispos de l’équipe',
		path: '/planning?view=team',
		icon: CalendarClock,
		keywords: 'dispo disponibilités créneaux quand agenda équipe'
	},
	{
		id: 'time',
		label: 'Temps passé',
		path: '/planning?mode=work',
		icon: Clock,
		keywords: 'temps passé chrono heures blocs bilan'
	},
	{
		id: 'accounts',
		label: 'Comptes partagés',
		path: '/resources?tab=accounts',
		icon: KeyRound,
		keywords: 'comptes mot de passe identifiants accès login secret'
	},
	{
		id: 'links',
		label: 'Liens',
		path: '/resources?tab=links',
		icon: Link,
		keywords: 'liens url sites figma docs'
	},
	{
		id: 'contacts',
		label: 'Contacts',
		path: '/resources?tab=contacts',
		icon: Contact,
		keywords: 'contacts personnes téléphone email clients'
	},
	{
		id: 'files',
		label: 'Fichiers',
		path: '/resources?tab=files',
		icon: Paperclip,
		keywords: 'fichiers documents images pdf dossiers'
	}
];

const fold = (text: string) =>
	text
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toLowerCase();

/** Every word of the query appears in the label, hint or keywords (accents ignored). */
export const matchesWords = (query: string, ...texts: string[]) => {
	const haystack = fold(texts.join(' '));
	return fold(query)
		.split(/\s+/)
		.every((word) => haystack.includes(word));
};
