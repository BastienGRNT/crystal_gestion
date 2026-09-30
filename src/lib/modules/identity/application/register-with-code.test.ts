import { describe, expect, it, vi } from 'vitest';
import { makeRegisterWithCode } from './register-with-code';

const input = { name: 'Zoé', email: 'zoe@test.fr', password: 'motdepasse', code: 'secret' };

describe('register with access code', () => {
	it('creates the account when the code matches', async () => {
		const register = vi.fn(async () => ({ id: 'u' }));
		await makeRegisterWithCode({ register: register as never, accessCode: 'secret' })(input);
		expect(register).toHaveBeenCalledWith(input);
	});

	it('refuses without the right code', async () => {
		const register = vi.fn();
		const run = makeRegisterWithCode({ register: register as never, accessCode: 'autre' });
		await expect(run(input)).rejects.toThrow(/Code d’accès incorrect/);
		expect(register).not.toHaveBeenCalled();
	});
});
