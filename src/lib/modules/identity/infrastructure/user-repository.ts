import { asc, count, eq } from 'drizzle-orm';
import type { Executor } from '$lib/server/db/types';
import type { UserRepository } from '../application/ports';
import type { User } from '../domain/user';
import { users } from './schema';

type Row = typeof users.$inferSelect;

const toUser = ({ id, email, name, color, preferences }: Row): User => ({
	id,
	email,
	name,
	color,
	preferences
});

export const drizzleUserRepository = (db: Executor): UserRepository => ({
	count: async () => (await db.select({ value: count() }).from(users))[0].value,
	findById: async (id) => {
		const [row] = await db.select().from(users).where(eq(users.id, id));
		return row ? toUser(row) : null;
	},
	findCredentials: async (email) => {
		const [row] = await db.select().from(users).where(eq(users.email, email));
		return row ? { user: toUser(row), passwordHash: row.passwordHash } : null;
	},
	create: async (input) => toUser((await db.insert(users).values(input).returning())[0]),
	savePreferences: async (id, preferences) =>
		toUser((await db.update(users).set({ preferences }).where(eq(users.id, id)).returning())[0]),
	list: async () => (await db.select().from(users).orderBy(asc(users.name))).map(toUser)
});
