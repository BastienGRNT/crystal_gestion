import { ensure, requiredText } from '../../kernel/domain/errors';

/**
 * A part of a product that grows (the site, appointments, prescriptions…): where a task
 * belongs, independent of when (the step). Shown only once a project has two of them.
 */
export interface Component {
	id: string;
	projectId: string;
	name: string;
	/** What it is, once delivered: the functional spec's map of features reads it. */
	description: string;
	/** The module it is a part of: the map has two levels, no more. */
	parentId: string | null;
	/** Index in the 8 tints of the theme. */
	color: number;
	position: number;
	archivedAt: string | null;
	createdAt: string;
}

export const MAX_COMPONENTS = 12;

export const validComponentName = (name: string) => requiredText(name, 'Le nom du module', 30);

export function ensureRoomForComponent(existing: Component[]) {
	ensure(
		existing.filter((c) => !c.archivedAt).length < MAX_COMPONENTS,
		`${MAX_COMPONENTS} modules au plus : archives-en un d’abord.`
	);
}

export const activeComponents = (components: Component[]) =>
	components.filter((c) => !c.archivedAt).sort((a, b) => a.position - b.position);

export function validComponentDescription(text: string): string {
	ensure(text.length <= 600, 'La description est trop longue (600 caractères maximum).');
	return text.trim();
}

/** Two levels: a sub-module's parent is a top module, and a module with parts has no parent. */
export function ensureParentFits(all: Component[], id: string, parentId: string | null) {
	if (!parentId) return;
	const parent = all.find((c) => c.id === parentId);
	ensure(parent && parent.id !== id, 'Module parent inconnu.');
	ensure(!parent.parentId, 'Deux niveaux au plus : choisis un module principal.');
	ensure(
		!all.some((c) => c.parentId === id && !c.archivedAt),
		'Ce module a déjà des sous-modules : il reste principal.'
	);
}
