import type { ElementBase } from '$lib/modules/kernel/domain/element';

export const MOSCOW = ['must', 'should', 'could', 'wont'] as const;
export type Moscow = (typeof MOSCOW)[number];

export const MOSCOW_LABELS: Record<Moscow, string> = {
	must: 'Must',
	should: 'Should',
	could: 'Could',
	wont: 'Won’t'
};

export const MOSCOW_HINTS: Record<Moscow, string> = {
	must: 'À faire absolument',
	should: 'À faire si possible',
	could: 'Ce serait bien',
	wont: 'Pas maintenant'
};

export interface FeatureFields {
	title: string;
	description: string;
	priority: Moscow;
	ownerId: string | null;
	doneCriteria: string;
}

export interface Feature extends ElementBase, FeatureFields {
	kind: 'feature';
	projectId: string;
	createdAt: string;
}

export const isImportantPriority = (priority: Moscow | null | undefined) =>
	priority === 'must' || priority === 'should';

export const byPriority = (a: Feature, b: Feature) =>
	MOSCOW.indexOf(a.priority) - MOSCOW.indexOf(b.priority) || a.createdAt.localeCompare(b.createdAt);
