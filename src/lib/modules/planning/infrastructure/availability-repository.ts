import { and, eq, getTableColumns } from 'drizzle-orm';
import type { Executor } from '$lib/server/db/types';
import { projectMembers } from '../../projects/infrastructure/schema';
import type {
	AvailabilityChanges,
	AvailabilityRepository,
	UserProjects
} from '../application/ports';
import type { Availability } from '../domain/availability';
import { availabilities } from './schema';

const toAvailability = (row: typeof availabilities.$inferSelect): Availability => ({
	...row,
	startsAt: row.startsAt.toISOString(),
	endsAt: row.endsAt.toISOString()
});

const toRow = ({ startsAt, endsAt, status }: AvailabilityChanges) => ({
	status,
	startsAt: startsAt ? new Date(startsAt) : undefined,
	endsAt: endsAt ? new Date(endsAt) : undefined
});

export const drizzleAvailabilityRepository = (db: Executor): AvailabilityRepository => ({
	create: async (input) => {
		const values = { ...input, startsAt: new Date(input.startsAt), endsAt: new Date(input.endsAt) };
		return toAvailability((await db.insert(availabilities).values(values).returning())[0]);
	},
	update: async (id, changes) =>
		toAvailability(
			(
				await db
					.update(availabilities)
					.set(toRow(changes))
					.where(eq(availabilities.id, id))
					.returning()
			)[0]
		),
	delete: async (id) => {
		await db.delete(availabilities).where(eq(availabilities.id, id));
	},
	findOwned: async (id, userId) => {
		const [row] = await db
			.select()
			.from(availabilities)
			.where(and(eq(availabilities.id, id), eq(availabilities.userId, userId)));
		return row ? toAvailability(row) : null;
	},
	listForProject: async (projectId) =>
		(
			await db
				.select(getTableColumns(availabilities))
				.from(availabilities)
				.innerJoin(projectMembers, eq(projectMembers.userId, availabilities.userId))
				.where(eq(projectMembers.projectId, projectId))
		).map(toAvailability)
});

export const drizzleUserProjects = (db: Executor): UserProjects => ({
	projectIdsOf: async (userId) =>
		(
			await db
				.select({ id: projectMembers.projectId })
				.from(projectMembers)
				.where(eq(projectMembers.userId, userId))
		).map((row) => row.id)
});
