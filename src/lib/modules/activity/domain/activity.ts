import type { ActivityVerb } from '$lib/modules/kernel/application/ports';
import type { ElementKind } from '$lib/modules/kernel/domain/element';

/** Keeps a snapshot of the element so the feed survives deletions. */
export interface Activity {
	id: string;
	projectId: string;
	actorId: string;
	verb: ActivityVerb;
	elementId: string | null;
	elementRef: string;
	elementKind: ElementKind;
	elementTitle: string;
	details: Record<string, string>;
	createdAt: string;
}

export const since = (activities: Activity[], moment: string | null, exceptActorId?: string) =>
	activities.filter(
		(activity) => (!moment || activity.createdAt > moment) && activity.actorId !== exceptActorId
	);
