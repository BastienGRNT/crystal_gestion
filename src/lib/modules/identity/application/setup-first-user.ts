import { forbidden } from '$lib/modules/kernel/domain/errors';
import type { UserRepository } from './ports';
import type { Registration } from './register-user';
import type { User } from '../domain/user';

export const makeSetupFirstUser =
	(deps: { users: UserRepository; register: (input: Registration) => Promise<User> }) =>
	async (input: Registration) => {
		if ((await deps.users.count()) > 0) throw forbidden('Le premier compte existe déjà');
		return deps.register(input);
	};
