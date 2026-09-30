import type { ProjectStore } from '$lib/client/project-store.svelte';
import type { RefTools } from '$lib/client/refs/ref-tools.svelte';
import type { Question } from '$lib/modules/discussion/domain/message';
import type { ElementSummary } from '$lib/modules/kernel/domain/element';
import type { RefView } from '$lib/ui/types';

/** What turning messages into views needs from the live project, as plain lookups. */
export interface ViewContext {
	meId: string;
	member: (id: string) => { name: string; color: string } | undefined;
	questions: Question[];
	element: (id: string) => ElementSummary | undefined;
	links: (id: string) => RefView[];
	today: Date;
}

export const viewContext = (store: ProjectStore, refs: RefTools, meId: string): ViewContext => ({
	meId,
	member: (id) => store.members.get(id),
	questions: store.questions.items,
	element: refs.findById,
	links: (id) => refs.backlinks(id).map(refs.view),
	today: new Date()
});
