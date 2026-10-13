import { createHash, randomBytes, randomUUID, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import type { PasswordHasher, TokenService } from '../application/ports';

const derive = promisify(scrypt) as (
	password: string,
	salt: string,
	length: number
) => Promise<Buffer>;
const KEY_LENGTH = 64;

export const scryptHasher: PasswordHasher = {
	async hash(password) {
		const salt = randomBytes(16).toString('hex');
		return `${salt}:${(await derive(password, salt, KEY_LENGTH)).toString('hex')}`;
	},
	async verify(password, stored) {
		const [salt, key] = stored.split(':');
		if (!salt || !key) return false;
		const derived = await derive(password, salt, KEY_LENGTH);
		return timingSafeEqual(derived, Buffer.from(key, 'hex'));
	}
};

export const randomTokens: TokenService = {
	generate: () => randomBytes(32).toString('base64url'),
	hash: (token) => createHash('sha256').update(token).digest('hex'),
	uuid: () => randomUUID()
};
