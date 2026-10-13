import { isDateKey, type DateKey } from '../../kernel/domain/dates';
import { ensure, requiredText } from '../../kernel/domain/errors';

export interface Project {
	id: string;
	slug: string;
	name: string;
	description: string;
	/** Index in the 8 tints of the theme. */
	color: number;
	/** Delivery date, when there is one. */
	deadline: DateKey | null;
	/** One sentence the team aims at this week: the focus everyone sees on the project home. */
	weekGoal: string;
	archivedAt: string | null;
	createdBy: string;
	createdAt: string;
}

export const PROJECT_COLORS = 8;

export const validProjectName = (name: string) => requiredText(name, 'Le nom du projet', 60);

export function validDescription(text: string): string {
	ensure(text.length <= 500, 'La description est trop longue (500 caractères maximum).');
	return text.trim();
}

export function validWeekGoal(text: string): string {
	ensure(text.length <= 160, 'L’objectif est trop long (160 caractères maximum).');
	return text.trim();
}

export function validDeadline(deadline: string | null): DateKey | null {
	ensure(deadline === null || isDateKey(deadline), 'Date limite invalide.');
	return deadline;
}

export function validProjectColor(color: number): number {
	ensure(Number.isInteger(color) && color >= 0 && color < PROJECT_COLORS, 'Couleur inconnue.');
	return color;
}

export function slugify(name: string): string {
	const slug = name
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 40)
		.replace(/-+$/, '');
	return slug || 'projet';
}

/** `crystal`, then `crystal-2`, `crystal-3`… so URLs stay readable and never collide. */
export function uniqueSlug(name: string, taken: string[]): string {
	const base = slugify(name);
	const used = new Set(taken);
	if (!used.has(base)) return base;
	let n = 2;
	while (used.has(`${base}-${n}`)) n++;
	return `${base}-${n}`;
}
