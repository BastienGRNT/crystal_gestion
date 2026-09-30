import { and, eq, inArray } from 'drizzle-orm';
import type { Executor } from '$lib/server/db/types';
import type { ElementRepository } from '../application/ports';
import { elements } from './schema';
import { refColumn } from './element-writer';

export const drizzleElementRepository = (db: Executor): ElementRepository => ({
	list: async (projectId) => {
		const rows = await db
			.select({
				id: elements.id,
				ref: refColumn,
				kind: elements.kind,
				title: elements.title,
				status: elements.status,
				createdBy: elements.createdBy,
				createdAt: elements.createdAt
			})
			.from(elements)
			.where(eq(elements.projectId, projectId));
		return rows.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() }));
	},
	idsForRefs: async (projectId, refs) => {
		const rows = await db
			.select({ id: elements.id })
			.from(elements)
			.where(and(eq(elements.projectId, projectId), inArray(refColumn, refs)));
		return rows.map((row) => row.id);
	}
});
