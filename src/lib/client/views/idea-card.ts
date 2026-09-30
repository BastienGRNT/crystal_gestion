import { needsTriage, type Idea } from '$lib/modules/ideas/domain/idea';
import { isDraft } from '../live/optimistic';
import {
	featureTag,
	person,
	type FeatureTagView,
	type PersonView,
	type ViewSources
} from './element-view';

export interface IdeaView {
	id: string;
	ref: string;
	title: string;
	note: string;
	createdAt: string;
	archived: boolean;
	untriaged: boolean;
	draft: boolean;
	feature: FeatureTagView | null;
	author: PersonView | null;
}

export const toIdeaView = (idea: Idea, s: ViewSources): IdeaView => ({
	id: idea.id,
	ref: idea.ref,
	title: idea.title,
	note: idea.note,
	createdAt: idea.createdAt,
	archived: idea.archivedAt !== null,
	untriaged: needsTriage(idea),
	draft: isDraft(idea.id),
	feature: featureTag(idea.featureId, s),
	author: person(idea.createdBy, s)
});

export const newestFirst = <T extends { createdAt: string }>(items: T[]) =>
	[...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
