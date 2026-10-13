import type { IdentityDeps } from './application/deps';
import { changePassword, touch, updateProfile } from './application/profile';
import { authenticate, login, logout, register } from './application/sessions';

export function createIdentity(deps: IdentityDeps) {
	return {
		hasUsers: async () => (await deps.users.count()) > 0,
		list: () => deps.users.list(),
		listByIds: async (ids: string[]) => (await deps.users.list()).filter((u) => ids.includes(u.id)),
		register: register(deps),
		login: login(deps),
		authenticate: authenticate(deps),
		logout: logout(deps),
		updateProfile: updateProfile(deps),
		changePassword: changePassword(deps),
		touch: touch(deps)
	};
}

export type Identity = ReturnType<typeof createIdentity>;
