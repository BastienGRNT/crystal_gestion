import { and, asc, eq, gte } from 'drizzle-orm';
import type { Db } from '$lib/server/db/types';
import { emptyWeek, type Availability } from '../domain/availability';
import type { AvailabilityRepository } from '../application/ports';
import { availabilityDays, availabilityWeek } from './schema';

type WeekRow = typeof availabilityWeek.$inferSelect;
type DayRow = typeof availabilityDays.$inferSelect;

function assemble(weeks: WeekRow[], days: DayRow[]): Availability[] {
	const byUser = new Map<string, Availability>();
	const of = (userId: string) => {
		if (!byUser.has(userId)) byUser.set(userId, { userId, template: emptyWeek(), overrides: [] });
		return byUser.get(userId)!;
	};
	for (const row of weeks) of(row.userId).template[row.weekday] = row.slots;
	for (const row of days) of(row.userId).overrides.push({ date: row.date, slots: row.slots });
	return [...byUser.values()];
}

export const drizzleAvailability = (db: Db): AvailabilityRepository => {
	async function load(since: string, userId?: string) {
		const weeks = await db
			.select()
			.from(availabilityWeek)
			.where(userId ? eq(availabilityWeek.userId, userId) : undefined);
		const days = await db
			.select()
			.from(availabilityDays)
			.where(
				and(
					gte(availabilityDays.date, since),
					userId ? eq(availabilityDays.userId, userId) : undefined
				)
			)
			.orderBy(asc(availabilityDays.date));
		return assemble(weeks, days);
	}

	return {
		all: (since) => load(since),
		get: async (userId, since) =>
			(await load(since, userId))[0] ?? { userId, template: emptyWeek(), overrides: [] },
		async setWeekday(userId, weekday, slots) {
			await db
				.insert(availabilityWeek)
				.values({ userId, weekday, slots })
				.onConflictDoUpdate({
					target: [availabilityWeek.userId, availabilityWeek.weekday],
					set: { slots }
				});
		},
		async setOverride(userId, date, slots) {
			await db
				.insert(availabilityDays)
				.values({ userId, date, slots })
				.onConflictDoUpdate({
					target: [availabilityDays.userId, availabilityDays.date],
					set: { slots }
				});
		},
		async clearOverride(userId, date) {
			await db
				.delete(availabilityDays)
				.where(and(eq(availabilityDays.userId, userId), eq(availabilityDays.date, date)));
		}
	};
};
