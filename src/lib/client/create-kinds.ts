import { Layers, Lightbulb, SquareCheckBig, Wrench } from '@lucide/svelte';

/** What can be created, with the key that opens its form (shown on its buttons). */
export const CREATE_KINDS = [
	{ value: 'task', label: 'Task', icon: SquareCheckBig, key: 'T' },
	{ value: 'fix', label: 'Fix', icon: Wrench, key: 'X' },
	{ value: 'feature', label: 'Feat', icon: Layers, key: 'F' },
	{ value: 'idea', label: 'Idée', icon: Lightbulb, key: 'I' }
] as const;

export type CreateKind = (typeof CREATE_KINDS)[number]['value'];

export const createKind = (value: CreateKind) => CREATE_KINDS.find((k) => k.value === value)!;

/** What the place a form was opened from already knows. */
export interface CreateSeed {
	title?: string;
	featureId?: string | null;
	status?: 'icebox' | 'todo';
	dueDate?: string | null;
	assigneeIds?: string[];
}
