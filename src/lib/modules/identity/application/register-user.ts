import type { Clock } from '$lib/modules/kernel/application/ports';
import { conflict } from '$lib/modules/kernel/domain/errors';
import { assertValidName, assertValidPassword } from '../domain/credentials';
import { colorForIndex, normalizeEmail } from '../domain/user';
import type { PasswordHasher, UserRepository } from './ports';

export interface Registration {
	email: string;
	name: string;
	password: string;
}

export const makeRegisterUser =
	(deps: { users: UserRepository; hasher: PasswordHasher; clock: Clock }) =>
	async (input: Registration) => {
		assertValidName(input.name);
		assertValidPassword(input.password);
		const email = normalizeEmail(input.email);
		if (await deps.users.findCredentials(email)) throw conflict('Cet email est déjà utilisé');
		return deps.users.create({
			email,
			name: input.name.trim(),
			passwordHash: await deps.hasher.hash(input.password),
			color: colorForIndex(await deps.users.count())
		});
	};
