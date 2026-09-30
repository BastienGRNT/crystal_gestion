import { byPriority, type Feature } from '$lib/modules/features/domain/feature';
import type { ThreadLink } from '$lib/ui/discussion';

/** #général first, then one thread per feature, most important first. */
export function threadLinks(features: Feature[], slug: string, activeRef: string | null) {
	const base = `/p/${slug}/discussion`;
	return [
		{ key: 'general', label: 'général', href: base, active: !activeRef },
		...[...features].sort(byPriority).map((feature) => ({
			key: feature.id,
			label: feature.title,
			ref: feature.ref,
			priority: feature.priority,
			href: `${base}/${feature.ref}`,
			active: feature.ref === activeRef
		}))
	] satisfies ThreadLink[];
}
