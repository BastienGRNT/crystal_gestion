import { invalid } from '../../kernel/domain/errors';
import { validColor, validName, validPassword, validStatusNote, type User } from '../domain/user';
import type { IdentityDeps } from './deps';
import type { ProfilePatch } from './ports';

export const updateProfile =
	(deps: IdentityDeps) =>
	async (userId: string, patch: ProfilePatch): Promise<User> => {
		const clean: ProfilePatch = {};
		if (patch.name !== undefined) clean.name = validName(patch.name);
		if (patch.color !== undefined) clean.color = validColor(patch.color);
		if (patch.status !== undefined) clean.status = patch.status;
		if (patch.statusNote !== undefined) clean.statusNote = validStatusNote(patch.statusNote);
		const user = await deps.users.update(userId, clean);
		deps.feed.saved(user);
		return user;
	};

/** Changing the password signs every other device out. */
export const changePassword =
	(deps: IdentityDeps) =>
	async (userId: string, input: { current: string; next: string }, sessionToken: string) => {
		const hash = await deps.users.passwordHash(userId);
		if (!hash || !(await deps.hasher.verify(input.current, hash)))
			throw invalid('Le mot de passe actuel est incorrect.');
		await deps.users.setPasswordHash(userId, await deps.hasher.hash(validPassword(input.next)));
		await deps.sessions.deleteOthers(userId, deps.tokens.hash(sessionToken));
	};

/** Remembers when someone was last connected, for "vu il y a 2 h". */
export const touch = (deps: IdentityDeps) => async (userId: string) => {
	const user = await deps.users.update(userId, { lastSeenAt: deps.clock.now().toISOString() });
	deps.feed.saved(user);
};
