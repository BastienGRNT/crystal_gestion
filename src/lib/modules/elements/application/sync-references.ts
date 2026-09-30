import type { ChangeFeed, ReferenceSync } from '$lib/modules/kernel/application/ports';
import { extractRefs } from '$lib/modules/kernel/domain/refs';
import type { ElementRepository, ReferenceRepository } from './ports';

export const makeReferenceSync = (deps: {
	elements: ElementRepository;
	references: ReferenceRepository;
	feed: ChangeFeed;
}): ReferenceSync => ({
	async sync(projectId, sourceId, texts) {
		const refs = extractRefs(texts.join('\n'));
		const ids = refs.length ? await deps.elements.idsForRefs(projectId, refs) : [];
		const targetIds = ids.filter((id) => id !== sourceId);
		await deps.references.replaceForSource(projectId, sourceId, targetIds);
		deps.feed.upserted('reference', projectId, { sourceId, targetIds });
	}
});
