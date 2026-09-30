import { isoOrNull, parseOptionalDate, type Executor } from '$lib/server/db/types';
import { drizzleElementStore } from '../../elements/infrastructure/element-store';
import type { Idea, IdeaFields } from '../domain/idea';
import { ideas } from './schema';

export const drizzleIdeaStore = (db: Executor) =>
	drizzleElementStore<typeof ideas, Idea, IdeaFields>(db, {
		table: ideas,
		kind: () => 'idea',
		titleOf: (fields) => fields.title,
		toRow: ({ note, featureId, archivedAt, triagedAt }) => ({
			note,
			featureId,
			archivedAt: parseOptionalDate(archivedAt),
			triagedAt: parseOptionalDate(triagedAt)
		}),
		toElement: (row, meta) => ({
			...row,
			kind: 'idea',
			ref: meta.ref,
			title: meta.title,
			archivedAt: isoOrNull(row.archivedAt),
			triagedAt: isoOrNull(row.triagedAt),
			createdBy: meta.createdBy,
			createdAt: meta.createdAt
		})
	});
