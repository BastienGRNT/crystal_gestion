import { and, eq, type SQL } from 'drizzle-orm';
import type { Executor } from '$lib/server/db/types';
import type { ElementStore } from '../../kernel/application/element-crud';
import type { ElementBase, ElementKind } from '../../kernel/domain/element';
import {
	elementSelect,
	type ElementMeta,
	type ElementTable,
	type QueryOptions
} from './element-select';
import { deleteElement, insertElement, updateElement } from './element-writer';

export type { ElementMeta } from './element-select';

type Element = ElementBase & { projectId: string };

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
	const select = elementSelect(db, table, config.toElement);
	const find = async (projectId: string, id: string) =>
		(await select(and(eq(table.projectId, projectId), eq(table.id, id))))[0] ?? null;
	return {
		query: select,
		find,
		list: (projectId) => select(eq(table.projectId, projectId)),
		create: async ({ projectId, createdBy, ...fields }) => {
			const typed = fields as Partial<Fields>;
			const id = await db.transaction(async (tx) => {
				const [kind, title, status] = [
					config.kind(typed),
					config.titleOf(typed) ?? '',
					config.statusOf?.(typed)
				];
				const element = await insertElement(tx, { projectId, kind, title, createdBy, status });
				const row = { ...config.toRow(typed), id: element.id, projectId };
				await tx.insert(table).values(row as TTable['$inferInsert']);
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
