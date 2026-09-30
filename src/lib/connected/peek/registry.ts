import type { Component } from 'svelte';
import type { ElementKind, ElementSummary } from '$lib/modules/kernel/domain/element';
import FileDetail from './FileDetail.svelte';
import IdeaDetail from './IdeaDetail.svelte';
import JournalDetail from './JournalDetail.svelte';
import ResourceDetail from './ResourceDetail.svelte';
import TaskDetail from './TaskDetail.svelte';

export type PeekDetail = Component<{ element: ElementSummary; onclose: () => void }>;

/** Detail view shown in the side peek for each kind; a new kind plugs in here. */
export const PEEK_DETAILS: Partial<Record<ElementKind, PeekDetail>> = {
	task: TaskDetail,
	decision: JournalDetail,
	fix: JournalDetail,
	scope: JournalDetail,
	idea: IdeaDetail,
	account: ResourceDetail,
	link: ResourceDetail,
	contact: ResourceDetail,
	file: FileDetail
};
