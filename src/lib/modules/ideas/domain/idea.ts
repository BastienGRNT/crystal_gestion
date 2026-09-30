import type { ElementBase } from '$lib/modules/kernel/domain/element';

export interface IdeaFields {
	title: string;
	note: string;
	featureId: string | null;
	archivedAt: string | null;
	/** Set when the weekly review decided to keep the idea as is. */
	triagedAt: string | null;
}

export interface Idea extends ElementBase, IdeaFields {
	kind: 'idea';
	projectId: string;
	createdBy: string | null;
	createdAt: string;
}

export const isOpen = (idea: Idea) => idea.archivedAt === null;
export const needsTriage = (idea: Idea) => isOpen(idea) && idea.triagedAt === null;
