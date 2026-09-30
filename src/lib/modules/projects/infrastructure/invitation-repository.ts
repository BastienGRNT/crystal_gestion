import { eq } from 'drizzle-orm';
import type { Executor } from '$lib/server/db/types';
import type { InvitationRepository } from '../application/ports';
import { invitations } from './schema';

export const drizzleInvitationRepository = (db: Executor): InvitationRepository => ({
	create: async (input) => {
		await db.insert(invitations).values(input);
	},
	findByTokenHash: async (tokenHash) => {
		const [row] = await db.select().from(invitations).where(eq(invitations.tokenHash, tokenHash));
		return row ?? null;
	},
	markAccepted: async (id, userId, at) => {
		await db
			.update(invitations)
			.set({ acceptedBy: userId, acceptedAt: at })
			.where(eq(invitations.id, id));
	}
});
