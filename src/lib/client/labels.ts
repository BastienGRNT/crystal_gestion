import type { WorkStatus } from '$lib/modules/identity/domain/user';
import type { MatrixBox } from '$lib/modules/tasks/domain/views';
import { Bug, Megaphone, Sparkles, Wrench } from '@lucide/svelte';
import type { TaskKind, TaskStatus } from '$lib/modules/tasks/domain/task';
import type { Icon } from '$lib/ui/types';

/** Words and colors of the matrix. Class names are written out in full for Tailwind. */
export const BOXES: Record<
	MatrixBox,
	{
		label: string;
		axes: string;
		hint: string;
		empty: string;
		dot: string;
		soft: string;
		text: string;
	}
> = {
	now: {
		label: 'Maintenant',
		axes: 'Urgent · Important',
		hint: 'Fais-le tout de suite.',
		empty: 'Rien de brûlant. Profites-en pour avancer sur le reste.',
		dot: 'bg-now',
		soft: 'bg-now-soft',
		text: 'text-now-text'
	},
	plan: {
		label: 'À planifier',
		axes: 'Important · Pas urgent',
		hint: 'Réserve-lui du temps avant que ça presse.',
		empty: 'Ce qui compte vraiment, sans urgence, vient ici.',
		dot: 'bg-plan',
		soft: 'bg-plan-soft',
		text: 'text-plan-text'
	},
	delegate: {
		label: 'À déléguer',
		axes: 'Urgent · Moins important',
		hint: 'Confie-le à l’autre ou expédie-le vite.',
		empty: 'Rien à confier pour l’instant.',
		dot: 'bg-delegate',
		soft: 'bg-delegate-soft',
		text: 'text-delegate-text'
	},
	later: {
		label: 'Plus tard',
		axes: 'Ni urgent · Ni important',
		hint: 'Garde-le de côté, ou laisse tomber.',
		empty: 'Rien en attente.',
		dot: 'bg-later',
		soft: 'bg-later-soft',
		text: 'text-later-text'
	},
	inbox: {
		label: 'À trier',
		axes: 'Pas encore rangé',
		hint: 'Glisse chaque tâche dans la bonne case.',
		empty: '',
		dot: 'bg-ink-4',
		soft: 'bg-surface-2',
		text: 'text-ink-2'
	}
};

export const STATUS_LABEL: Record<TaskStatus, string> = {
	idea: 'Idée',
	todo: 'À faire',
	doing: 'En cours',
	review: 'En revue',
	done: 'Terminé'
};

export const WORK_STATUS: Record<WorkStatus, { label: string; dot: string }> = {
	available: { label: 'Disponible', dot: 'bg-ok' },
	focus: { label: 'Ne pas déranger', dot: 'bg-now' },
	away: { label: 'En pause', dot: 'bg-warn' }
};

/** Theme tints for projects and avatars (`--tint-0…7`). */
export const tint = (index: number) => `var(--tint-${((index % 8) + 8) % 8})`;

/**
 * The four kinds of work. Only a bug gets a colored background: it is the one that asks for a
 * reaction. Class names are written out in full for Tailwind.
 */
export const KINDS: Record<
	TaskKind,
	{ label: string; plural: string; icon: Icon; hint: string; text: string; chip: string }
> = {
	feature: {
		label: 'Fonctionnalité',
		plural: 'Fonctionnalités',
		icon: Sparkles,
		hint: 'Ce que le produit saura faire de plus',
		text: 'text-accent-text',
		chip: 'text-accent-text'
	},
	bug: {
		label: 'Bug',
		plural: 'Bugs',
		icon: Bug,
		hint: 'Quelque chose ne marche pas',
		text: 'text-danger-text',
		chip: 'bg-danger-soft text-danger-text'
	},
	tech: {
		label: 'Technique',
		plural: 'Technique',
		icon: Wrench,
		hint: 'Interne : dette, mises à jour, outillage',
		text: 'text-ink-2',
		chip: 'text-ink-2'
	},
	action: {
		label: 'Action',
		plural: 'Actions',
		icon: Megaphone,
		hint: 'Hors code : appeler, vendre, publier, facturer',
		text: 'text-delegate-text',
		chip: 'text-delegate-text'
	}
};
