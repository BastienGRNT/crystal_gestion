import { forbidden } from '$lib/modules/kernel/domain/errors';
import { matchesAccessCode } from '../domain/access-code';
import type { makeRegisterUser, Registration } from './register-user';

type Register = ReturnType<typeof makeRegisterUser>;

/** Self sign-up for people without an invitation link, gated by the configured access code. */
export const makeRegisterWithCode =
	(deps: { register: Register; accessCode: string | null }) =>
	async (input: Registration & { code: string }) => {
		if (!matchesAccessCode(deps.accessCode, input.code))
			throw forbidden('Code d’accès incorrect. Demande-le à un membre, ou un lien d’invitation.');
		return deps.register(input);
	};
