import {
	BookOpen,
	Contact,
	FileText,
	Gem,
	KeyRound,
	Lightbulb,
	Link,
	MessageSquare,
	SquareCheckBig,
	Wrench,
	Waypoints
} from '@lucide/svelte';
import type { ElementKind } from '$lib/modules/kernel/domain/element';

export const KIND_META: Record<ElementKind, { label: string; icon: typeof Gem }> = {
	feature: { label: 'Feature', icon: Gem },
	task: { label: 'Tâche', icon: SquareCheckBig },
	decision: { label: 'Décision', icon: BookOpen },
	fix: { label: 'Bug résolu', icon: Wrench },
	scope: { label: 'Changement de périmètre', icon: Waypoints },
	idea: { label: 'Idée', icon: Lightbulb },
	message: { label: 'Message', icon: MessageSquare },
	account: { label: 'Compte', icon: KeyRound },
	link: { label: 'Lien', icon: Link },
	contact: { label: 'Contact', icon: Contact },
	file: { label: 'Fichier', icon: FileText }
};

/** Kinds shown in the side peek; features and messages have their own pages. */
export const PEEKABLE: ElementKind[] = [
	'task',
	'decision',
	'fix',
	'scope',
	'idea',
	'account',
	'link',
	'contact',
	'file'
];

export function elementHref(
	slug: string,
	element: { kind: ElementKind; ref: string },
	currentPath = `/p/${slug}`
) {
	if (element.kind === 'feature') return `/p/${slug}/features/${element.ref}`;
	if (element.kind === 'message') return `/p/${slug}/go/${element.ref}`;
	return `${currentPath}?peek=${element.ref}`;
}
