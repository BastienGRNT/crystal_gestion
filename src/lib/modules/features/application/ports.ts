import type { Actor } from '$lib/modules/kernel/domain/actor';
import type { Feature, FeatureFields } from '../domain/feature';
import type { ScopeChange } from '../domain/scope';

export interface FeatureRepository {
	create(input: FeatureFields & { projectId: string; createdBy: string }): Promise<Feature>;
	update(projectId: string, id: string, changes: Partial<FeatureFields>): Promise<Feature>;
	setArchived(projectId: string, id: string, at: Date | null): Promise<Feature>;
	delete(projectId: string, id: string): Promise<void>;
	find(projectId: string, id: string): Promise<Feature | null>;
	list(projectId: string): Promise<Feature[]>;
}

/** Implemented by the journal: scope changes are recorded there automatically. */
export interface ScopeLog {
	record(actor: Actor, feature: Feature, change: ScopeChange): Promise<void>;
}

export interface ProjectClock {
	projectCreatedAt(projectId: string): Promise<Date>;
}
