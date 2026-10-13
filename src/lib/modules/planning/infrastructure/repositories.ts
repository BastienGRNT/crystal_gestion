import { and, eq, gte, inArray } from 'drizzle-orm';
import { iso } from '$lib/server/db/columns';
import type { Db } from '$lib/server/db/types';
import type { AvailabilitySlot, WorkBlock } from '../domain/availability';
import type { BlockRepository, SlotRepository } from '../application/ports';
import { availabilitySlots, workBlocks } from './schema';

type Ranged = { startsAt: Date; endsAt: Date };
const toIso = <T extends Ranged>(row: T) => ({
	...row,
	startsAt: iso(row.startsAt),
	endsAt: iso(row.endsAt)
});
const toDates = <T extends { startsAt: string; endsAt: string }>(item: T) => ({
	...item,
	startsAt: new Date(item.startsAt),
	endsAt: new Date(item.endsAt)
});

export const drizzleSlots = (db: Db): SlotRepository => ({
	ofUsers: async (ids, since) =>
		ids.length
			? (
					await db
						.select()
						.from(availabilitySlots)
						.where(
							and(inArray(availabilitySlots.userId, ids), gte(availabilitySlots.endsAt, since))
						)
				).map((row) => toIso(row) as AvailabilitySlot)
			: [],
	async get(id) {
		const [row] = await db.select().from(availabilitySlots).where(eq(availabilitySlots.id, id));
		return row ? (toIso(row) as AvailabilitySlot) : null;
	},
	async insert(slot) {
		await db.insert(availabilitySlots).values(toDates(slot));
	},
	async save(slot) {
		await db.update(availabilitySlots).set(toDates(slot)).where(eq(availabilitySlots.id, slot.id));
	},
	async delete(id) {
		await db.delete(availabilitySlots).where(eq(availabilitySlots.id, id));
	}
});

export const drizzleBlocks = (db: Db): BlockRepository => ({
	ofProjects: async (ids, since) =>
		ids.length
			? (
					await db
						.select()
						.from(workBlocks)
						.where(and(inArray(workBlocks.projectId, ids), gte(workBlocks.endsAt, since)))
				).map((row) => toIso(row) as WorkBlock)
			: [],
	async get(id) {
		const [row] = await db.select().from(workBlocks).where(eq(workBlocks.id, id));
		return row ? (toIso(row) as WorkBlock) : null;
	},
	async insert(block) {
		await db.insert(workBlocks).values(toDates(block));
	},
	async save(block) {
		await db.update(workBlocks).set(toDates(block)).where(eq(workBlocks.id, block.id));
	},
	async delete(id) {
		await db.delete(workBlocks).where(eq(workBlocks.id, id));
	}
});
