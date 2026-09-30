import type { RefView, Suggestion } from '$lib/ui/types';
import type { ElementSummary } from '$lib/modules/kernel/domain/element';
import type { ProjectStore } from '../project-store.svelte';
import { elementHref } from './kinds';
import { searchElements } from './search';
import { statusOf } from './status';

/** Everything text fields need to resolve, suggest and link references and mentions. */
export class RefTools {
	private byRef = $derived.by(
		() => new Map(this.store.elements.items.map((element) => [element.ref, element]))
	);
	private byId = $derived.by(
		() => new Map(this.store.elements.items.map((element) => [element.id, element]))
	);
	private names = $derived.by(
		() => new Map(this.store.members.items.map((member) => [member.id, member.name]))
	);

	constructor(
		private store: ProjectStore,
		private currentPath: () => string
	) {}

	find = (ref: string) => this.byRef.get(ref);
	findById = (id: string) => this.byId.get(id);
	href = (element: Pick<ElementSummary, 'kind' | 'ref'>) =>
		elementHref(this.store.project.slug, element, this.currentPath());
	personName = (userId: string) => this.names.get(userId);

	view = (element: ElementSummary): RefView => ({
		ref: element.ref,
		title: element.title,
		kind: element.kind,
		href: this.href(element),
		status: statusOf(this.store, element)
	});

	resolve = (ref: string): RefView | undefined => {
		const element = this.byRef.get(ref);
		return element && this.view(element);
	};

	suggest = (symbol: '#' | '@', query: string): Suggestion[] => {
		if (symbol === '#')
			return searchElements(this.store.elements.items, query).map((element) => ({
				id: element.id,
				label: element.title,
				hint: element.ref,
				insert: `#${element.ref}`
			}));
		const q = query.toLowerCase();
		return this.store.members.items
			.filter((member) => member.name.toLowerCase().includes(q))
			.map((member) => ({ id: member.id, label: member.name, insert: `@${member.name}` }));
	};

	/** Elements whose texts reference the given element: the "Mentionné dans" section. */
	backlinks = (id: string) =>
		this.store.references
			.filter((reference) => reference.targetId === id)
			.map((reference) => this.byId.get(reference.sourceId))
			.filter((element): element is ElementSummary => element !== undefined);
}
