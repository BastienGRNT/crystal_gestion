import { eq, inArray, sql } from 'drizzle-orm';
import type { PgColumn, PgTable } from 'drizzle-orm/pg-core';
import type { Db } from '$lib/server/db/types';
import type { FramingStores, Store } from '../application/ports';
import {
	epics,
	glossaryTerms,
	initiatives,
	journeys,
	stakeholders,
	stories,
	storyCounters,
	strategies,
	swotItems
} from './schema';

type Table = PgTable & { id: PgColumn; projectId: PgColumn; createdAt: PgColumn };

/** Every framing table has an id, a project and a creation date: one adapter fits them all. */
function drizzleStore<T extends { createdAt: string }>(db: Db, table: Table): Store<T> {
	const toItem = (row: Record<string, unknown>) =>
		({ ...row, createdAt: (row.createdAt as Date).toISOString() }) as unknown as T;
	const toRow = (item: T) => ({ ...item, createdAt: new Date(item.createdAt) });
	const select = () => db.select().from(table as PgTable);
	return {
		ofProjects: async (ids) =>
			ids.length ? (await select().where(inArray(table.projectId, ids))).map(toItem) : [],
		ofProject: async (id) => (await select().where(eq(table.projectId, id))).map(toItem),
		async get(id) {
			const [row] = await select().where(eq(table.id, id));
			return row ? toItem(row) : null;
		},
		async put(item) {
			const row = toRow(item);
			await db
				.insert(table)
				.values(row as never)
				.onConflictDoUpdate({ target: table.id, set: row as never });
		},
		async delete(id) {
			await db.delete(table).where(eq(table.id, id));
		}
	};
}

export const drizzleFramingStores = (db: Db): FramingStores => ({
	initiatives: drizzleStore(db, initiatives),
	epics: drizzleStore(db, epics),
	stories: drizzleStore(db, stories),
	stakeholders: drizzleStore(db, stakeholders),
	journeys: drizzleStore(db, journeys),
	terms: drizzleStore(db, glossaryTerms),
	swot: drizzleStore(db, swotItems),
	strategies: drizzleStore(db, strategies)
});

export const drizzleStoryNumbers = (db: Db) => async (projectId: string) => {
	const [row] = await db
		.insert(storyCounters)
		.values({ projectId, last: 1 })
		.onConflictDoUpdate({
			target: storyCounters.projectId,
			set: { last: sql`${storyCounters.last} + 1` }
		})
		.returning({ last: storyCounters.last });
	return row.last;
};
