import type { Feature } from '$lib/modules/features/domain/feature';

const PALETTE_SIZE = 8;

/** Stable planning color of a feature: its rank among the project features (oldest first). */
export function featureColors(features: Pick<Feature, 'id' | 'createdAt'>[]) {
	const ranked = [...features].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
	const colors = new Map(ranked.map((f, index) => [f.id, `var(--feature-${index % PALETTE_SIZE})`]));
	return (featureId: string | null | undefined) =>
		(featureId && colors.get(featureId)) || 'var(--feature-none)';
}
