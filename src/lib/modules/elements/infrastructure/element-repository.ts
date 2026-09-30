import { and, eq, inArray, type SQL } from 'drizzle-orm';
import type { Executor } from '$lib/server/db/types';
import type { ElementRepository } from '../application/ports';
import { elements } from './schema';
import { refColumn } from './element-writer';

export const drizzleElementRepository = (db: Executor): ElementRepository => {
	const select = async (where: SQL | undefined) => {
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
			.where(where);
		return rows.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() }));
	};
	return {
		list: (projectId) => select(eq(elements.projectId, projectId)),
		findByRef: async (projectId, ref) =>
			(await select(and(eq(elements.projectId, projectId), eq(refColumn, ref))))[0] ?? null,
		idsForRefs: async (projectId, refs) => {
			const rows = await db
				.select({ id: elements.id })
				.from(elements)
				.where(and(eq(elements.projectId, projectId), inArray(refColumn, refs)));
			return rows.map((row) => row.id);
		}
	};
};
