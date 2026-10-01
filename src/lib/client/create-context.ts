import type { CreateKind, CreateSeed } from './create-kinds';
import type { ProjectStore } from './project-store.svelte';

/** What « Créer » makes from where you are: a decision from the journal, a task in the open feature… */
export function defaultCreateKind(url: URL, store: ProjectStore): [CreateKind, CreateSeed] {
	const seed = createSeed(url, store);
	const path = url.pathname.slice(`/p/${store.project.slug}`.length);
	if (path === '/features') return ['feature', seed];
	if (path.startsWith('/journal')) return ['decision', seed];
	if (path.startsWith('/ideas') || path.startsWith('/review')) return ['idea', seed];
	return ['task', seed];
}

/** The feature of the page (feature page or its discussion thread), so new things land in it. */
export function createSeed(url: URL, store: ProjectStore): CreateSeed {
	const ref = url.pathname.match(/\/(?:features|discussion)\/(F-\d+)/)?.[1];
	const feature = ref ? store.features.items.find((f) => f.ref === ref) : undefined;
	return feature ? { featureId: feature.id } : {};
}
