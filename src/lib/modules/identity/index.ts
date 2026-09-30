import type { Clock } from '$lib/modules/kernel/application/ports';
import type {
	PasswordHasher,
	SessionRepository,
	TokenService,
	UserRepository
} from './application/ports';
import { makeLogin } from './application/login';
import { makeUpdatePreferences } from './application/preferences';
import { makeRegisterUser } from './application/register-user';
import { makeRegisterWithCode } from './application/register-with-code';
import { makeAuthenticate, makeCloseSession, makeOpenSession } from './application/sessions';
import { makeSetupFirstUser } from './application/setup-first-user';

export interface IdentityDeps {
	users: UserRepository;
	sessions: SessionRepository;
	hasher: PasswordHasher;
	tokens: TokenService;
	clock: Clock;
	/** Lets people sign up without an invitation; `null` keeps sign-up invitation-only. */
	accessCode: string | null;
}

export function createIdentityModule(deps: IdentityDeps) {
	const register = makeRegisterUser(deps);
	return {
		register,
		registerWithCode: makeRegisterWithCode({ register, accessCode: deps.accessCode }),
		registrationOpen: () => deps.accessCode !== null,
		setupFirstUser: makeSetupFirstUser({ users: deps.users, register }),
		login: makeLogin(deps),
		openSession: makeOpenSession(deps),
		authenticate: makeAuthenticate(deps),
		closeSession: makeCloseSession(deps),
		updatePreferences: makeUpdatePreferences(deps),
		hasUsers: async () => (await deps.users.count()) > 0,
		listUsers: () => deps.users.list(),
		findUser: (id: string) => deps.users.findById(id)
	};
}

export type IdentityModule = ReturnType<typeof createIdentityModule>;
