import type { Idea } from '$lib/modules/ideas/domain/idea';
import type { JournalEntry } from '$lib/modules/journal/domain/journal-entry';
import type { ProjectStore } from '../project-store.svelte';
import type { ViewSources } from './element-view';
import { toIdeaView } from './idea-card';
import { toJournalView } from './journal-entry';

/** Live indexes behind journal and idea lists, rebuilt only when their collection changes. */
export class ElementSources {
	private featuresById = $derived.by(
		() => new Map(this.store.features.items.map((feature) => [feature.id, feature]))
	);
	private membersById = $derived.by(
		() => new Map(this.store.members.items.map((member) => [member.id, member]))
	);
	private sources: ViewSources = $derived.by(() => ({
		slug: this.store.project.slug,
		featuresById: this.featuresById,
		membersById: this.membersById
	}));

	private features = $derived.by(() =>
		this.store.features.items.map((f) => ({ value: f.id, label: `${f.ref} · ${f.title}` }))
	);

	constructor(private store: ProjectStore) {}

	/** Options of a feature select; the empty value comes first with its own meaning. */
	featureOptions = (emptyLabel = 'Aucune feature') => [
		{ value: '', label: emptyLabel },
		...this.features
	];
	journal = (entry: JournalEntry) => toJournalView(entry, this.sources);
	idea = (idea: Idea) => toIdeaView(idea, this.sources);
}
