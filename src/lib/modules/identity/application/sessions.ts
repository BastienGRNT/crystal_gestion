import type { Clock } from '$lib/modules/kernel/application/ports';
import { expiryFrom, isExpired, needsRenewal } from '../domain/session';
import type { SessionRepository, TokenService, UserRepository } from './ports';

interface Deps {
	sessions: SessionRepository;
	users: UserRepository;
	tokens: TokenService;
	clock: Clock;
}

export const makeOpenSession = (deps: Deps) => async (userId: string) => {
	const token = deps.tokens.generate();
	const expiresAt = expiryFrom(deps.clock.now());
	await deps.sessions.create(deps.tokens.hash(token), { userId, expiresAt });
	return { token, expiresAt };
};

export const makeAuthenticate = (deps: Deps) => async (token: string) => {
	const id = deps.tokens.hash(token);
	const session = await deps.sessions.find(id);
	const now = deps.clock.now();
	if (!session || isExpired(session, now)) return null;
	if (needsRenewal(session, now)) await deps.sessions.extend(id, expiryFrom(now));
	return deps.users.findById(session.userId);
};

export const makeCloseSession = (deps: Deps) => (token: string) =>
	deps.sessions.delete(deps.tokens.hash(token));
