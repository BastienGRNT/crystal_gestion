import type { Channel } from '$lib/modules/discussion/domain/channel';
import { byPriority, type Feature } from '$lib/modules/features/domain/feature';
import type { ThreadLink } from '$lib/ui/discussion';

/** Général and its channels, then one thread per feature, most important first. */
export function threadLinks(
	features: Feature[],
	channels: Channel[],
	slug: string,
	active: string | null
) {
	const base = `/p/${slug}/discussion`;
	const team: ThreadLink[] = [
		{ key: 'general', label: 'Général', href: base, active: !active },
		...channels.map((channel) => ({
			key: channel.id,
			label: channel.name,
			href: `${base}/${channel.id}`,
			channel: true,
			active: channel.id === active
		}))
	];
	const byFeature: ThreadLink[] = [...features].sort(byPriority).map((feature) => ({
		key: feature.id,
		label: feature.title,
		ref: feature.ref,
		priority: feature.priority,
		href: `${base}/${feature.ref}`,
		active: feature.ref === active
	}));
	return { team, features: byFeature };
}
