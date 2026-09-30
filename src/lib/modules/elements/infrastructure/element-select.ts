import { desc, eq, getTableColumns, type SQL } from 'drizzle-orm';
import type { PgColumn, PgTable } from 'drizzle-orm/pg-core';
import type { Executor } from '$lib/server/db/types';
import type { ElementKind } from '../../kernel/domain/element';
import { refColumn } from './element-writer';
import { elements } from './schema';

export type ElementTable = PgTable & { id: PgColumn; projectId: PgColumn };

export interface ElementMeta {
	ref: string;
	kind: ElementKind;
	title: string;
	createdBy: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface QueryOptions {
	newestFirst?: boolean;
	limit?: number;
}

/** Rows of a module table joined with their registry entry (ref, title, author, dates). */
export const elementSelect =
	<TTable extends ElementTable, T>(
		db: Executor,
		table: TTable,
		toElement: (row: TTable['$inferSelect'], meta: ElementMeta) => T
	) =>
	async (where: SQL | undefined, { newestFirst = false, limit = 100_000 }: QueryOptions = {}) => {
		const rows = await db
			.select({
				row: getTableColumns(table),
				...{ ref: refColumn, kind: elements.kind, title: elements.title },
				...{
					createdBy: elements.createdBy,
					createdAt: elements.createdAt,
					updatedAt: elements.updatedAt
				}
			})
			.from(table as PgTable)
			.innerJoin(elements, eq(elements.id, table.id))
			.where(where)
			.orderBy(newestFirst ? desc(elements.createdAt) : elements.createdAt)
			.limit(limit);
		return rows.map(({ row, createdAt, updatedAt, ...meta }) =>
			toElement(row as TTable['$inferSelect'], {
				...meta,
				...{ createdAt: createdAt.toISOString(), updatedAt: updatedAt.toISOString() }
			})
		);
	};
