import type { UserPreferences } from '../domain/user';
import type { UserRepository } from './ports';

export const makeUpdatePreferences =
	(deps: { users: UserRepository }) => async (userId: string, changes: UserPreferences) => {
		const user = await deps.users.findById(userId);
		return deps.users.savePreferences(userId, { ...user?.preferences, ...changes });
	};
