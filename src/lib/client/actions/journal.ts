import type { JournalEntry, JournalFields } from '$lib/modules/journal/domain/journal-entry';
import { send } from '../commands';
import { draftId, optimistic } from '../live/optimistic';
import type { ProjectStore } from '../project-store.svelte';
import { createOptimistically } from './create';

type EntryInput = Omit<JournalFields, 'kind' | 'details'> & {
	kind: 'decision' | 'fix';
	details: JournalEntry['details'];
};
type Details = {
	rationale?: string;
	decidedBy?: string[];
	decidedOn?: string | null;
	problem?: string;
	cause?: string;
	solution?: string;
};

export function journalActions(store: ProjectStore, meId: string) {
	const projectId = () => store.project.id;
	return {
		create: (input: EntryInput & { details: Details }) =>
			createOptimistically(
				store,
				'journal',
				{
					...input,
					id: draftId(),
					ref: input.kind === 'decision' ? 'D-…' : 'X-…',
					projectId: projectId(),
					createdBy: meId,
					createdAt: new Date().toISOString()
				} as JournalEntry,
				() => send('journal.create', { projectId: projectId(), ...input })
			),
		update: (
			id: string,
			changes: Partial<Pick<JournalFields, 'title' | 'featureId'>> & { details?: Details }
		) =>
			optimistic(
				() => store.journal.patch(id, changes),
				() => send('journal.update', { projectId: projectId(), id, changes })
			),
		remove: (id: string) =>
			optimistic(
				() => store.journal.remove(id),
				() => send('journal.delete', { projectId: projectId(), id })
			)
	};
}
