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
	/**
	 * The Cap, as one formatted note: who it is for, their problem, who pays, what we do not do
	 * (or, for a client project, the brief). Written once, read when in doubt.
	 */
	brief: string;
	/** Days sold to the client, for a fixed-price project: what the time spent is compared to. */
	soldDays: number | null;
	/** What to check before each release (backups, migrations…), unticked again every time. */
	shipChecklist: string[];
	archivedAt: string | null;
	createdBy: string;
	createdAt: string;
}

export type ProjectPatch = Partial<
	Pick<
		Project,
		| 'name'
		| 'description'
		| 'color'
		| 'deadline'
		| 'weekGoal'
		| 'brief'
		| 'soldDays'
		| 'shipChecklist'
	>
>;

export const PROJECT_COLORS = 8;

export const validProjectName = (name: string) => requiredText(name, 'Le nom du projet', 60);

export function validDescription(text: string): string {
	ensure(text.length <= 1000, 'La description est trop longue (1000 caractères maximum).');
	return text.trim();
}

export function validWeekGoal(text: string): string {
	ensure(text.length <= 160, 'L’objectif est trop long (160 caractères maximum).');
	return text.trim();
}

export function validBrief(text: string): string {
	ensure(text.length <= 20_000, 'Le cap est trop long (20 000 caractères maximum).');
	return text.trim();
}

export function validSoldDays(days: number | null): number | null {
	ensure(days === null || (Number.isFinite(days) && days > 0 && days < 10_000), 'Budget invalide.');
	return days;
}

export const DEFAULT_SHIP_CHECKLIST = [
	'Sauvegarde de la base faite',
	'Migrations testées sur une copie',
	'Testé sur un téléphone',
	'Le suivi des erreurs est ouvert'
];

export function validShipChecklist(items: string[]): string[] {
	ensure(items.length <= 20, '20 points au plus.');
	return items.map((i) => i.trim().slice(0, 120)).filter(Boolean);
}

/** The headings offered for an empty Cap: a frame to fill in ten minutes, not a form. */
export const BRIEF_HEADINGS = [
	'Pour qui',
	'Leur problème',
	'Notre réponse',
	'Qui paie, combien',
	'Ce qu’on ne fait pas'
];

export const BRIEF_TEMPLATE = BRIEF_HEADINGS.map((h) => `## ${h}\n\n`).join('\n');

/** The Cap's fixed sections: each one its own text, none can be dropped. */
export function briefSections(brief: string): Record<string, string> {
	const out: Record<string, string> = Object.fromEntries(BRIEF_HEADINGS.map((h) => [h, '']));
	let current = BRIEF_HEADINGS[0];
	for (const line of brief.split('\n')) {
		const heading = line.match(/^##\s+(.*)$/)?.[1].trim();
		// Text before any known heading (an older free Cap) lands in the first section.
		if (heading && heading in out) current = heading;
		else out[current] += `${line}\n`;
	}
	for (const h of BRIEF_HEADINGS) out[h] = out[h].trim();
	return out;
}

export const joinBrief = (sections: Record<string, string>) =>
	BRIEF_HEADINGS.map((h) => `## ${h}\n\n${(sections[h] ?? '').trim()}`).join('\n\n');

/** Framed enough not to be asked again: some words under the headings. */
export const isFramed = (project: Pick<Project, 'brief'>) =>
	project.brief.replace(/^#{1,3}\s.*$/gm, '').trim().length > 20;

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
