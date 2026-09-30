import { DomainError } from '$lib/modules/kernel/domain/errors';
import { normalizeEmail } from '../domain/user';
import type { PasswordHasher, UserRepository } from './ports';

export const makeLogin =
	(deps: { users: UserRepository; hasher: PasswordHasher }) =>
	async (email: string, password: string) => {
		const found = await deps.users.findCredentials(normalizeEmail(email));
		const valid = found && (await deps.hasher.verify(password, found.passwordHash));
		if (!valid) throw new DomainError('unauthenticated', 'Email ou mot de passe incorrect');
		return found.user;
	};
