import { makeElementCrud } from '$lib/modules/kernel/application/element-crud';
import type { ElementStore } from '$lib/modules/kernel/application/element-crud';
import type { ActivityLog, ChangeFeed, ReferenceSync } from '$lib/modules/kernel/application/ports';
import { makeScopeLog } from './application/scope-log';
import { textsOf, type JournalEntry, type JournalFields } from './domain/journal-entry';

export function createJournalModule(deps: {
	store: ElementStore<JournalEntry, JournalFields>;
	feed: ChangeFeed;
	activity: ActivityLog;
	references: ReferenceSync;
}) {
	const crud = makeElementCrud({ ...deps, entity: 'journal', textsOf });
	return { ...crud, scopeLog: makeScopeLog(crud) };
}

export type JournalModule = ReturnType<typeof createJournalModule>;
