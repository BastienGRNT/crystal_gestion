import type { ScopeLog } from '$lib/modules/features/application/ports';
import type { ElementCrud } from '$lib/modules/kernel/application/element-crud';
import type { JournalEntry, JournalFields } from '../domain/journal-entry';
import { scopeTitle } from '../domain/scope-title';

/** Scope changes land in the journal without anyone writing them. */
export const makeScopeLog = (journal: ElementCrud<JournalEntry, JournalFields>): ScopeLog => ({
	async record(actor, feature, change) {
		await journal.create(actor, {
			projectId: feature.projectId,
			kind: 'scope',
			title: scopeTitle(feature.title, change),
			featureId: change.change === 'removed' ? null : feature.id,
			details: { ...change, featureTitle: feature.title }
		});
	}
});
