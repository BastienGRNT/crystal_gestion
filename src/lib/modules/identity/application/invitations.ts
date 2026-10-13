import { invalid } from '../../kernel/domain/errors';
import { invitationExpiry, isUsable } from '../domain/session';
import { createAccount, openSession, type AccountInput, type IdentityDeps } from './deps';
import type { SignedIn } from './sessions';

/** Returns the secret token to put in the link; only its hash is stored. */
export const createInvitation = (deps: IdentityDeps) => async (actorId: string) => {
	const token = deps.tokens.generate();
	const now = deps.clock.now();
	await deps.invitations.create(deps.tokens.hash(token), {
		createdBy: actorId,
		expiresAt: invitationExpiry(now),
		usedAt: null
	});
	return { token, expiresAt: invitationExpiry(now).toISOString() };
};

/** Who invited, or null when the link can no longer be used. */
export const inspectInvitation = (deps: IdentityDeps) => async (token: string) => {
	const invitation = await deps.invitations.find(deps.tokens.hash(token));
	if (!invitation || !isUsable(invitation, deps.clock.now())) return null;
	const inviter = await deps.users.findById(invitation.createdBy);
	return { invitedBy: inviter?.name ?? 'Quelqu’un' };
};

export const acceptInvitation =
	(deps: IdentityDeps) =>
	async (token: string, input: AccountInput): Promise<SignedIn> => {
		const tokenHash = deps.tokens.hash(token);
		const invitation = await deps.invitations.find(tokenHash);
		if (!invitation || !isUsable(invitation, deps.clock.now()))
			throw invalid('Ce lien d’invitation a expiré ou a déjà servi. Demande-en un nouveau.');
		const user = await createAccount(deps, input);
		await deps.invitations.markUsed(tokenHash, user.id, deps.clock.now());
		return { user, token: await openSession(deps, user.id) };
	};
