import type { Executor } from '$lib/server/db/types';
import { drizzleElementStore } from '../../elements/infrastructure/element-store';
import { asJournalKind, type JournalEntry, type JournalFields } from '../domain/journal-entry';
import { journalEntries } from './schema';

export const drizzleJournalStore = (db: Executor) =>
	drizzleElementStore<typeof journalEntries, JournalEntry, JournalFields>(db, {
		table: journalEntries,
		kind: (fields) => fields.kind ?? 'decision',
		titleOf: (fields) => fields.title,
		toRow: ({ featureId, details }) => ({ featureId, details }),
		toElement: (row, meta) => ({
			...row,
			kind: asJournalKind(meta.kind),
			ref: meta.ref,
			title: meta.title,
			createdBy: meta.createdBy,
			createdAt: meta.createdAt
		})
	});
