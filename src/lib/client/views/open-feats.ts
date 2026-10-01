import { byPriority, isArchived, type Feature } from '$lib/modules/features/domain/feature';
import { featureColors } from './feature-colors';

/** Feats one can still attach work to, most important first, with their color. */
export function openFeats(features: Feature[]) {
	const colorOf = featureColors(features);
	return [...features]
		.filter((f) => !isArchived(f))
		.sort(byPriority)
		.map((f) => ({ id: f.id, title: f.title, color: colorOf(f.id) }));
}
