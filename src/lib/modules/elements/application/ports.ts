import type { ElementSummary } from '$lib/modules/kernel/domain/element';

export interface Reference {
	sourceId: string;
	targetId: string;
}

export interface ElementRepository {
	list(projectId: string): Promise<ElementSummary[]>;
	idsForRefs(projectId: string, refs: string[]): Promise<string[]>;
	findByRef(projectId: string, ref: string): Promise<ElementSummary | null>;
}

export interface ReferenceRepository {
	list(projectId: string): Promise<Reference[]>;
	replaceForSource(projectId: string, sourceId: string, targetIds: string[]): Promise<void>;
}
