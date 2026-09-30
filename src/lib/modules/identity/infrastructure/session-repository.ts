import { eq } from 'drizzle-orm';
import type { Executor } from '$lib/server/db/types';
import type { SessionRepository } from '../application/ports';
import { sessions } from './schema';

export const drizzleSessionRepository = (db: Executor): SessionRepository => ({
	create: async (id, { userId, expiresAt }) => {
		await db.insert(sessions).values({ id, userId, expiresAt });
	},
	find: async (id) => {
		const [row] = await db.select().from(sessions).where(eq(sessions.id, id));
		return row ? { userId: row.userId, expiresAt: row.expiresAt } : null;
	},
	extend: async (id, expiresAt) => {
		await db.update(sessions).set({ expiresAt }).where(eq(sessions.id, id));
	},
	delete: async (id) => {
		await db.delete(sessions).where(eq(sessions.id, id));
	}
});
