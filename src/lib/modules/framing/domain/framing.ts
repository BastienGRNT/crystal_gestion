import { ensure, requiredText } from '../../kernel/domain/errors';

/**
 * The framing of a project: what a newcomer reads to understand it, and what the team rereads
 * so as not to lose the course. It is a reference, never a gate: work on the board never waits
 * for it. Every item belongs to one project and is written once; the documents (note de
 * cadrage, cahiers des charges) are views computed from these items.
 */
interface Owned {
	id: string;
	projectId: string;
	createdAt: string;
}

/** A big goal several epics serve ("Remplacer le téléphone"), measured by one of the numbers. */
export interface Initiative extends Owned {
	title: string;
	why: string;
	metricId: string | null;
	position: number;
}

/** A large set of features around one module or process. `later`: out of scope for now. */
export interface Epic extends Owned {
	initiativeId: string | null;
	componentId: string | null;
	title: string;
	description: string;
	later: boolean;
	position: number;
}

/** A test that says when a story is done; with its data and expected result, a test case. */
export interface Criterion {
	id: string;
	text: string;
	done: boolean;
	/** The data to try it with ("créneau du 12/11 à 9 h, Paul Martin, 06…"). */
	data: string;
	expected: string;
}

/** "En tant que <persona>, je veux <want> afin de <soThat>": a need, before any work on it. */
export interface Story extends Owned {
	/** `US-7` inside its project. */
	number: number;
	epicId: string | null;
	personaId: string | null;
	want: string;
	soThat: string;
	criteria: Criterion[];
	position: number;
}

export const STAKEHOLDER_ROLES = [
	'decides',
	'pays',
	'uses',
	'validates',
	'prescribes',
	'contributes'
] as const;
export type StakeholderRole = (typeof STAKEHOLDER_ROLES)[number];
export const LEVELS = ['low', 'high'] as const;
export type Level = (typeof LEVELS)[number];
export const TECH_LEVELS = ['low', 'medium', 'high'] as const;
export type TechLevel = (typeof TECH_LEVELS)[number];
export const INFORM_EVERY = ['week', 'step', 'release'] as const;
export type InformEvery = (typeof INFORM_EVERY)[number];

/** Someone the project matters to. One who `uses` it is a persona of the functional spec. */
export interface Stakeholder extends Owned {
	name: string;
	organization: string;
	role: StakeholderRole;
	influence: Level;
	interest: Level;
	/** What they expect, or a persona's needs. */
	expects: string;
	techLevel: TechLevel | null;
	/** A persona's key interactions with the product. */
	interactions: string;
	informEvery: InformEvery | null;
	/** When they are on the team. */
	userId: string | null;
	position: number;
}

/** A user journey: screens in order and business rules ("si le paiement échoue…"). */
export interface Journey extends Owned {
	title: string;
	body: string;
	position: number;
}

/** A word of the trade, so everyone means the same thing by it. */
export interface Term extends Owned {
	term: string;
	definition: string;
}

export const SWOT_QUADRANTS = ['S', 'W', 'O', 'T'] as const;
export type SwotQuadrant = (typeof SWOT_QUADRANTS)[number];

export interface SwotItem extends Owned {
	quadrant: SwotQuadrant;
	text: string;
	position: number;
}

/** TOWS: crossing an inside factor (S, W) with an outside one (O, T) gives a strategy. */
export const STRATEGY_KINDS = ['SO', 'WO', 'ST', 'WT'] as const;
export type StrategyKind = (typeof STRATEGY_KINDS)[number];

/** A strategy leads somewhere, or it is only words: an epic to build, or a bet to check. */
export interface Strategy extends Owned {
	kind: StrategyKind;
	text: string;
	itemIds: string[];
	epicId: string | null;
	hypothesisId: string | null;
}

export const MAX_SWOT_PER_QUADRANT = 5;
export const MAX_CRITERIA = 12;

export const validTitleOf =
	(label: string, max = 120) =>
	(text: string) =>
		requiredText(text, label, max);

export function optionalText(text: string, label: string, max: number): string {
	ensure(text.length <= max, `${label} est trop long (${max} caractères maximum).`);
	return text.trim();
}

export function validCriteria(criteria: Criterion[]): Criterion[] {
	ensure(criteria.length <= MAX_CRITERIA, `${MAX_CRITERIA} critères au plus : découpe la story.`);
	return criteria.map((c) => ({
		id: c.id,
		text: requiredText(c.text, 'Un critère', 300),
		done: c.done,
		data: optionalText(c.data, 'Le jeu de données', 1000),
		expected: optionalText(c.expected, 'Le résultat attendu', 500)
	}));
}

export function ensureRoomInQuadrant(items: SwotItem[], quadrant: SwotQuadrant) {
	ensure(
		items.filter((i) => i.quadrant === quadrant).length < MAX_SWOT_PER_QUADRANT,
		`${MAX_SWOT_PER_QUADRANT} éléments au plus par case : garde ce qui compte vraiment.`
	);
}

/** S and O feed SO, and so on: a strategy only crosses the two families its name says. */
export function fitsStrategy(kind: StrategyKind, quadrant: SwotQuadrant) {
	return kind.includes(quadrant);
}

export const storyRef = (story: Pick<Story, 'number'>) => `US-${story.number}`;

/** "En tant que patient, je veux réserver sans compte afin de ne pas abandonner." */
export function storySentence(story: Pick<Story, 'want' | 'soThat'>, persona: string | null) {
	const who = `En tant que ${persona ?? 'utilisateur'}, je veux ${story.want}`;
	return story.soThat ? `${who} afin de ${story.soThat}.` : `${who}.`;
}
