import { isDateKey, type DateKey } from '../../kernel/domain/dates';
import { ensure, requiredText } from '../../kernel/domain/errors';

export interface Project {
	id: string;
	slug: string;
	name: string;
	description: string;
	/** Index in the 8 tints of the theme. */
	color: number;
	/** What kind of project it is: it sets how much framing is worth asking for. */
	kind: ProjectKind;
	/** Delivery date, when there is one. */
	deadline: DateKey | null;
	/** One sentence the team aims at this week: the focus everyone sees on the project home. */
	weekGoal: string;
	/**
	 * The framing note, as one formatted note in QQOQCCP sections (why, who, what, what we do
	 * not do, where, how many). When and how are never typed: the steps and the technical spec
	 * say them. Written once, read when in doubt.
	 */
	brief: string;
	/** The technical spec: how it is built, in fixed sections (`TECH_HEADINGS`). */
	techSpec: string;
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
		| 'techSpec'
		| 'kind'
		| 'soldDays'
		| 'shipChecklist'
	>
>;

export const PROJECT_COLORS = 8;

/**
 * Express: a few weeks, little framing. Produit: our own product, framed for the long run.
 * Client: built for someone, whose functional spec is the contract.
 */
export const PROJECT_KINDS = ['express', 'product', 'client'] as const;
export type ProjectKind = (typeof PROJECT_KINDS)[number];

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
	ensure(text.length <= 20_000, 'La note de cadrage est trop longue (20 000 caractères maximum).');
	return text.trim();
}

export function validTechSpec(text: string): string {
	ensure(text.length <= 40_000, 'Le cahier des charges technique est trop long.');
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

/**
 * The QQOQCCP sections of the framing note, in the order they are asked. "Quand" and
 * "Comment" are not typed: the steps and the technical spec answer them.
 */
export const BRIEF_HEADINGS = [
	'Pourquoi',
	'Qui',
	'Quoi',
	'Ce qu’on ne fait pas',
	'Où',
	'Combien'
] as const;
export type BriefHeading = (typeof BRIEF_HEADINGS)[number];

/** The headings of the first Caps, read into the section that now holds them. */
const OLD_BRIEF_HEADINGS: Record<string, BriefHeading> = {
	'Pour qui': 'Qui',
	'Leur problème': 'Pourquoi',
	'Notre réponse': 'Quoi',
	'Qui paie, combien': 'Qui',
	Contraintes: 'Où'
};

/** The technical spec's fixed sections. */
export const TECH_HEADINGS = [
	'Performance',
	'Sécurité et données personnelles',
	'Plateformes et accessibilité',
	'Services externes',
	'Hébergement',
	'Stack',
	'Environnements et mise en ligne',
	'Définition de « fini »',
	'Conventions',
	'Après la mise en ligne'
] as const;
export type TechHeading = (typeof TECH_HEADINGS)[number];

/**
 * Splits a note into its fixed `##` sections. Text under no known heading (an older free note)
 * lands in the first section; an old heading lands in the section that replaced it.
 */
export function sectionsOf<H extends string>(
	text: string,
	headings: readonly H[],
	aliases: Record<string, H> = {}
): Record<H, string> {
	const out = Object.fromEntries(headings.map((h) => [h, ''])) as Record<H, string>;
	let current = headings[0];
	for (const line of text.split('\n')) {
		const heading = line.match(/^##\s+(.*)$/)?.[1].trim();
		const known = heading && (headings.includes(heading as H) ? (heading as H) : aliases[heading]);
		if (known) current = known;
		else out[current] += `${line}\n`;
	}
	for (const h of headings) out[h] = out[h].replace(/\n{3,}/g, '\n\n').trim();
	return out;
}

export const joinSections = <H extends string>(
	sections: Record<H, string>,
	headings: readonly H[]
) => headings.map((h) => `## ${h}\n\n${(sections[h] ?? '').trim()}`).join('\n\n');

export const briefSections = (brief: string) =>
	sectionsOf(brief, BRIEF_HEADINGS, OLD_BRIEF_HEADINGS);
export const joinBrief = (sections: Record<BriefHeading, string>) =>
	joinSections(sections, BRIEF_HEADINGS);
export const techSections = (spec: string) => sectionsOf(spec, TECH_HEADINGS);
export const joinTech = (sections: Record<TechHeading, string>) =>
	joinSections(sections, TECH_HEADINGS);

/** The three questions asked at the start: without them, nobody knows what the project is. */
export const STARTING_HEADINGS: BriefHeading[] = ['Pourquoi', 'Qui', 'Quoi'];

/** Framed enough not to be asked again: why, who and what have a few words each. */
export const isFramed = (project: Pick<Project, 'brief'>) => {
	const sections = briefSections(project.brief);
	return STARTING_HEADINGS.every((h) => sections[h].length > 10);
};

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
