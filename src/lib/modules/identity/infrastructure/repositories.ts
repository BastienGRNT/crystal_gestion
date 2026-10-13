import { and, asc, count, eq, ne } from 'drizzle-orm';
import { isoOrNull, iso } from '$lib/server/db/columns';
import type { Db } from '$lib/server/db/types';
import { notFound } from '../../kernel/domain/errors';
import type { User } from '../domain/user';
import type { SessionRepository, UserRepository } from '../application/ports';
import { sessions, users } from './schema';

const toUser = ({ passwordHash: _, ...row }: typeof users.$inferSelect): User => ({
	...row,
	lastSeenAt: isoOrNull(row.lastSeenAt),
	createdAt: iso(row.createdAt)
});

export const drizzleUsers = (db: Db): UserRepository => ({
	count: async () => (await db.select({ n: count() }).from(users))[0].n,
	list: async () => (await db.select().from(users).orderBy(asc(users.createdAt))).map(toUser),
	async findById(id) {
		const [row] = await db.select().from(users).where(eq(users.id, id));
		return row ? toUser(row) : null;
	},
	async findByEmail(email) {
		const [row] = await db.select().from(users).where(eq(users.email, email));
		return row ? toUser(row) : null;
	},
	async passwordHash(id) {
		const [row] = await db.select({ hash: users.passwordHash }).from(users).where(eq(users.id, id));
		return row?.hash ?? null;
	},
	async create(user, passwordHash) {
		await db.insert(users).values({
			...user,
			passwordHash,
			lastSeenAt: null,
			createdAt: new Date(user.createdAt)
		});
	},
	async update(id, { lastSeenAt, ...patch }) {
		const values = lastSeenAt ? { ...patch, lastSeenAt: new Date(lastSeenAt) } : patch;
		const [row] = await db.update(users).set(values).where(eq(users.id, id)).returning();
		if (!row) throw notFound('Utilisateur');
		return toUser(row);
	},
	async setPasswordHash(id, passwordHash) {
		await db.update(users).set({ passwordHash }).where(eq(users.id, id));
	}
});

export const drizzleSessions = (db: Db): SessionRepository => ({
	async create(session) {
		await db.insert(sessions).values(session);
	},
	async find(tokenHash) {
		const [row] = await db.select().from(sessions).where(eq(sessions.tokenHash, tokenHash));
		return row ? { userId: row.userId, expiresAt: row.expiresAt } : null;
	},
	async renew(tokenHash, expiresAt) {
		await db.update(sessions).set({ expiresAt }).where(eq(sessions.tokenHash, tokenHash));
	},
	async delete(tokenHash) {
		await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
	},
	async deleteOthers(userId, keep) {
		await db.delete(sessions).where(and(eq(sessions.userId, userId), ne(sessions.tokenHash, keep)));
	}
});
