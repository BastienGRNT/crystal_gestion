import type { ActivityVerb } from '$lib/modules/kernel/application/ports';
import type { Activity } from '$lib/modules/activity/domain/activity';
import type { RefView } from '$lib/ui/types';
import { timeAgo } from '../format';

export const VERB_LABELS: Record<ActivityVerb, string> = {
	created: 'a créé',
	updated: 'a modifié',
	moved: 'a déplacé',
	completed: 'a terminé',
	deleted: 'a supprimé',
	posted: 'a écrit'
};

export interface ActivityView {
	id: string;
	actor: { name: string; color: string };
	verb: string;
	element: RefView;
	deleted: boolean;
	detail: string | null;
	when: string;
}

type Person = { name: string; color: string };

export function toActivityView(
	activity: Activity,
	actor: Person | undefined,
	href: (a: Activity) => string
): ActivityView {
	return {
		id: activity.id,
		actor: actor ?? { name: 'Quelqu’un', color: '#8b8894' },
		verb: VERB_LABELS[activity.verb],
		element: {
			ref: activity.elementRef,
			title: activity.elementTitle,
			kind: activity.elementKind,
			href: href(activity)
		},
		deleted: activity.verb === 'deleted',
		detail:
			activity.details.from && activity.details.to
				? `${activity.details.from} → ${activity.details.to}`
				: null,
		when: timeAgo(activity.createdAt)
	};
}
