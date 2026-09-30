import type { ChangeFeed } from '$lib/modules/kernel/application/ports';
import type { ElementRepository, ReferenceRepository } from './application/ports';
import { makeReferenceSync } from './application/sync-references';

export function createElementsModule(deps: {
	elements: ElementRepository;
	references: ReferenceRepository;
	feed: ChangeFeed;
}) {
	return {
		referenceSync: makeReferenceSync(deps),
		listElements: (projectId: string) => deps.elements.list(projectId),
		listReferences: (projectId: string) => deps.references.list(projectId)
	};
}

export type ElementsModule = ReturnType<typeof createElementsModule>;
