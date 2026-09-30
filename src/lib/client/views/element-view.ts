import type { Feature, Moscow } from '$lib/modules/features/domain/feature';
import type { Member } from '$lib/modules/projects/domain/project';

export type PersonView = Pick<Member, 'id' | 'name' | 'color'>;

export interface FeatureTagView {
	id: string;
	ref: string;
	title: string;
	priority: Moscow;
	href: string;
}

/** Indexes needed to turn raw DTOs into what list items display. */
export interface ViewSources {
	slug: string;
	featuresById: Map<string, Feature>;
	membersById: Map<string, Member>;
}

export function featureTag(featureId: string | null, s: ViewSources): FeatureTagView | null {
	const feature = featureId ? s.featuresById.get(featureId) : undefined;
	if (!feature) return null;
	const { id, ref, title, priority } = feature;
	return { id, ref, title, priority, href: `/p/${s.slug}/features/${ref}` };
}

export const person = (userId: string | null, s: ViewSources): PersonView | null =>
	(userId && s.membersById.get(userId)) || null;

export const people = (ids: string[], s: ViewSources) =>
	ids.map((id) => s.membersById.get(id)).filter((member): member is Member => !!member);
