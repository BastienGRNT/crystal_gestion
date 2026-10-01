import { byPriority, isArchived, type Feature } from '$lib/modules/features/domain/feature';
import { progressOf } from '$lib/modules/tasks/domain/progress';
import type { Task } from '$lib/modules/tasks/domain/task';
import type { SidebarFeature } from '$lib/ui/types';
import { featureColors } from './feature-colors';

/** Features in progress, most important first; icebox and archived ones stay in Gestion. */
export function sidebarFeatures(
	features: Feature[],
	tasks: Task[],
	slug: string,
	pathname: string
): SidebarFeature[] {
	const colorOf = featureColors(features);
	return features
		.filter((f) => !isArchived(f) && f.priority !== 'wont')
		.sort(byPriority)
		.map((f) => {
			const href = `/p/${slug}/features/${f.ref}`;
			return {
				...{ id: f.id, title: f.title, color: colorOf(f.id), href },
				ratio: progressOf(tasks.filter((t) => t.featureId === f.id)).ratio,
				active: pathname.startsWith(href)
			};
		});
}
