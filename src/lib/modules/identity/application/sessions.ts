import { forbidden, invalid } from '../../kernel/domain/errors';
import { sessionExpiry, shouldRenew } from '../domain/session';
import type { User } from '../domain/user';
import { createAccount, openSession, type AccountInput, type IdentityDeps } from './deps';

export interface SignedIn {
	user: User;
	token: string;
}

export const setupFirstUser =
	(deps: IdentityDeps) =>
	async (input: AccountInput): Promise<SignedIn> => {
		if ((await deps.users.count()) > 0)
			throw forbidden('Le premier compte existe déjà : connecte-toi.');
		const user = await createAccount(deps, input);
		return { user, token: await openSession(deps, user.id) };
	};

export const login =
	(deps: IdentityDeps) =>
	async (input: { email: string; password: string }): Promise<SignedIn> => {
		const user = await deps.users.findByEmail(input.email.trim().toLowerCase());
		const hash = user && (await deps.users.passwordHash(user.id));
		const valid = hash ? await deps.hasher.verify(input.password, hash) : false;
		if (!user || !valid) throw invalid('Email ou mot de passe incorrect.');
		return { user, token: await openSession(deps, user.id) };
	};

export const authenticate =
	(deps: IdentityDeps) =>
	async (token: string): Promise<User | null> => {
		const tokenHash = deps.tokens.hash(token);
		const session = await deps.sessions.find(tokenHash);
		if (!session) return null;
		const now = deps.clock.now();
		if (session.expiresAt <= now) {
			await deps.sessions.delete(tokenHash);
			return null;
		}
		if (shouldRenew(session.expiresAt, now))
			await deps.sessions.renew(tokenHash, sessionExpiry(now));
		return deps.users.findById(session.userId);
	};

export const logout = (deps: IdentityDeps) => (token: string) =>
	deps.sessions.delete(deps.tokens.hash(token));
