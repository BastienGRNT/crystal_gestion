import { Bug, Layers, Lightbulb, Scale, SquareCheckBig } from '@lucide/svelte';

/** Everything « Nouveau » makes, with its one-letter shortcut and what it is for. */
export const CREATE_KINDS = [
	{
		value: 'task',
		label: 'Tâche',
		icon: SquareCheckBig,
		key: 'C',
		placeholder: 'Que faut-il faire ?',
		hint: 'Une action concrète, dans une feature ou non'
	},
	{
		value: 'bug',
		label: 'Bug',
		icon: Bug,
		key: 'B',
		placeholder: 'Qu’est-ce qui ne marche pas ?',
		hint: 'Quelque chose à corriger'
	},
	{
		value: 'feature',
		label: 'Feature',
		icon: Layers,
		key: 'F',
		placeholder: 'Nom de la feature (ex. Paiement Stripe)',
		hint: 'Un morceau du produit, découpé en tâches'
	},
	{
		value: 'idea',
		label: 'Idée',
		icon: Lightbulb,
		key: 'I',
		placeholder: 'Ton idée en une phrase',
		hint: 'Hors produit : quelqu’un à contacter, une piste'
	},
	{
		value: 'decision',
		label: 'Décision',
		icon: Scale,
		key: 'D',
		placeholder: 'Qu’avez-vous décidé ?',
		hint: 'Gardée dans le journal, avec sa raison'
	}
] as const;

export type CreateKind = (typeof CREATE_KINDS)[number]['value'];

export const createKind = (value: CreateKind) => CREATE_KINDS.find((k) => k.value === value)!;

/** What the place « Nouveau » was opened from already knows. */
export interface CreateSeed {
	title?: string;
	featureId?: string | null;
	status?: 'icebox' | 'todo';
	dueDate?: string | null;
}
