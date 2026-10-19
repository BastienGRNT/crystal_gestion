import { ensure, requiredText } from '../../kernel/domain/errors';

/**
 * A part of a product that grows (the site, appointments, prescriptions…): where a task
 * belongs, independent of when (the step). Shown only once a project has two of them.
 */
export interface Component {
	id: string;
	projectId: string;
	name: string;
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
