export const ELEMENT_PREFIXES = {
	feature: 'F',
	task: 'T',
	decision: 'D',
	fix: 'X',
	scope: 'S',
	idea: 'I',
	message: 'M',
	account: 'R',
	link: 'R',
	contact: 'R',
	file: 'R'
} as const;

export type ElementKind = keyof typeof ELEMENT_PREFIXES;
export type ElementPrefix = (typeof ELEMENT_PREFIXES)[ElementKind];

/** Every referenceable DTO extends this, so references, search and realtime stay generic. */
export interface ElementBase {
	id: string;
	ref: string;
	kind: ElementKind;
	title: string;
}

export interface ElementSummary extends ElementBase {
	status: string | null;
	createdBy: string | null;
	createdAt: string;
}

export const prefixOf = (kind: ElementKind): ElementPrefix => ELEMENT_PREFIXES[kind];

export const formatRef = (prefix: string, number: number) => `${prefix}-${number}`;
