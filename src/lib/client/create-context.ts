import type { CreateSeed } from './create-kinds';
import type { ProjectStore } from './project-store.svelte';

/** The feat of the page (feat page or its thread), so a Task created by key lands in it. */
export function createSeed(url: URL, store: ProjectStore): CreateSeed {
	const ref = url.pathname.match(/\/(?:features|discussion)\/(F-\d+)/)?.[1];
	const feature = ref ? store.features.items.find((f) => f.ref === ref) : undefined;
	return feature ? { featureId: feature.id } : {};
}
