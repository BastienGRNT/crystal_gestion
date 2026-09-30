import { and, desc, eq, getTableColumns, type SQL } from 'drizzle-orm';
import type { PgColumn, PgTable } from 'drizzle-orm/pg-core';
import type { Executor } from '$lib/server/db/types';
import type { ElementStore } from '../../kernel/application/element-crud';
import type { ElementBase, ElementKind } from '../../kernel/domain/element';
import { deleteElement, insertElement, refColumn, updateElement } from './element-writer';
import { elements } from './schema';

type ElementTable = PgTable & { id: PgColumn; projectId: PgColumn };
type Element = ElementBase & { projectId: string };

export interface ElementMeta {
	ref: string;
	kind: ElementKind;
	title: string;
	createdBy: string | null;
	createdAt: string;
	updatedAt: string;
}

interface QueryOptions {
	newestFirst?: boolean;
	limit?: number;
}

interface Config<TTable extends ElementTable, T extends Element, Fields> {
	table: TTable;
	kind: (fields: Partial<Fields>) => ElementKind;
	toElement: (row: TTable['$inferSelect'], meta: ElementMeta) => T;
	toRow: (fields: Partial<Fields>) => Partial<TTable['$inferInsert']>;
	titleOf: (fields: Partial<Fields>) => string | undefined;
	statusOf?: (fields: Partial<Fields>) => string | null | undefined;
}

/** Generic persistence of a module table sharing its id with the element registry. */
export function drizzleElementStore<TTable extends ElementTable, T extends Element, Fields>(
	db: Executor,
	config: Config<TTable, T, Fields>
): ElementStore<T, Fields> & {
	query: (where: SQL | undefined, options?: QueryOptions) => Promise<T[]>;
} {
	const { table } = config;
	const select = async (
		where: SQL | undefined,
		{ newestFirst = false, limit = 100_000 }: QueryOptions = {}
	) => {
		const rows = await db
			.select({
				row: getTableColumns(table),
				ref: refColumn,
				kind: elements.kind,
				title: elements.title,
				createdBy: elements.createdBy,
				createdAt: elements.createdAt,
				updatedAt: elements.updatedAt
			})
			.from(table as PgTable)
			.innerJoin(elements, eq(elements.id, table.id))
			.where(where)
			.orderBy(newestFirst ? desc(elements.createdAt) : elements.createdAt)
			.limit(limit);
		return rows.map(({ row, createdAt, updatedAt, ...meta }) =>
			config.toElement(row as TTable['$inferSelect'], {
				...meta,
				createdAt: createdAt.toISOString(),
				updatedAt: updatedAt.toISOString()
			})
		);
	};
	const find = async (projectId: string, id: string) =>
		(await select(and(eq(table.projectId, projectId), eq(table.id, id))))[0] ?? null;
	return {
		query: select,
		find,
		list: (projectId) => select(eq(table.projectId, projectId)),
		create: async ({ projectId, createdBy, ...fields }) => {
			const typed = fields as Partial<Fields>;
			const id = await db.transaction(async (tx) => {
				const title = config.titleOf(typed) ?? '';
				const element = await insertElement(tx, {
					projectId,
					kind: config.kind(typed),
					title,
					createdBy,
					status: config.statusOf?.(typed)
				});
				await tx
					.insert(table)
					.values({ ...config.toRow(typed), id: element.id, projectId } as TTable['$inferInsert']);
				return element.id;
			});
			return (await find(projectId, id))!;
		},
		update: async (projectId, id, changes) => {
			await db.transaction(async (tx) => {
				const row = config.toRow(changes);
				if (Object.keys(row).length) await tx.update(table).set(row).where(eq(table.id, id));
				await updateElement(tx, id, {
					title: config.titleOf(changes),
					status: config.statusOf?.(changes)
				});
			});
			return (await find(projectId, id))!;
		},
		delete: (_projectId, id) => deleteElement(db, id)
	};
}
