import { Bug, Layers, Lightbulb, Scale, SquareCheckBig, Wrench } from '@lucide/svelte';

/** Everything the « Créer » dialog makes, with its one-letter shortcut. */
export const CREATE_KINDS = [
	{
		value: 'task',
		label: 'Tâche',
		icon: SquareCheckBig,
		key: 'C',
		placeholder: 'Que faut-il faire ?'
	},
	{ value: 'bug', label: 'Bug', icon: Bug, key: 'B', placeholder: 'Qu’est-ce qui ne marche pas ?' },
	{
		value: 'feature',
		label: 'Feature',
		icon: Layers,
		key: 'F',
		placeholder: 'Nom de la feature (ex. Paiement Stripe)'
	},
	{
		value: 'idea',
		label: 'Idée',
		icon: Lightbulb,
		key: 'I',
		placeholder: 'Ton idée en une phrase'
	},
	{
		value: 'decision',
		label: 'Décision',
		icon: Scale,
		key: 'D',
		placeholder: 'Qu’avez-vous décidé ?'
	},
	{
		value: 'fix',
		label: 'Bug résolu',
		icon: Wrench,
		key: 'R',
		placeholder: 'Quel bug as-tu corrigé ?'
	}
] as const;

export type CreateKind = (typeof CREATE_KINDS)[number]['value'];

export const createKind = (value: CreateKind) => CREATE_KINDS.find((k) => k.value === value)!;

/** What the page the dialog was opened from already knows. */
export interface CreateSeed {
	title?: string;
	featureId?: string | null;
}
