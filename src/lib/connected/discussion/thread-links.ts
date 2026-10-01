import type { Channel } from '$lib/modules/discussion/domain/channel';
import { byPriority, isArchived, type Feature } from '$lib/modules/features/domain/feature';
import { featureColors } from '$lib/client/views/feature-colors';
import type { ThreadLink } from '$lib/ui/discussion';

/** Général and its channels, then one thread per feature in progress, most important first. */
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
	const colorOf = featureColors(features);
	const open = features.filter((f) => !isArchived(f) || f.ref === active);
	const byFeature: ThreadLink[] = open.sort(byPriority).map((feature) => ({
		key: feature.id,
		label: feature.title,
		ref: feature.ref,
		color: colorOf(feature.id),
		href: `${base}/${feature.ref}`,
		active: feature.ref === active
	}));
	return { team, features: byFeature };
}
