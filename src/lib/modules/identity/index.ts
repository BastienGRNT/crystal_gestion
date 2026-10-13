import type { IdentityDeps } from './application/deps';
import { acceptInvitation, createInvitation, inspectInvitation } from './application/invitations';
import { changePassword, touch, updateProfile } from './application/profile';
import { authenticate, login, logout, setupFirstUser } from './application/sessions';

export function createIdentity(deps: IdentityDeps) {
	return {
		hasUsers: async () => (await deps.users.count()) > 0,
		list: () => deps.users.list(),
		setupFirstUser: setupFirstUser(deps),
		login: login(deps),
		authenticate: authenticate(deps),
		logout: logout(deps),
		createInvitation: createInvitation(deps),
		inspectInvitation: inspectInvitation(deps),
		acceptInvitation: acceptInvitation(deps),
		updateProfile: updateProfile(deps),
		changePassword: changePassword(deps),
		touch: touch(deps)
	};
}

export type Identity = ReturnType<typeof createIdentity>;
