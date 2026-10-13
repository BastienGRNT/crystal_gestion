import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'node:crypto';
import type { SecretCipher } from '../application/ports';

/** AES-256-GCM, key derived from the app secret. Format: `v1.iv.tag.data`, base64url parts. */
export function aesCipher(appSecret: string): SecretCipher {
	const key = scryptSync(appSecret, 'crystal-vault-v1', 32);
	return {
		encrypt(plain) {
			const iv = randomBytes(12);
			const cipher = createCipheriv('aes-256-gcm', key, iv);
			const data = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
			return ['v1', iv, cipher.getAuthTag(), data]
				.map((part) => (typeof part === 'string' ? part : part.toString('base64url')))
				.join('.');
		},
		decrypt(stored) {
			const [version, iv, tag, data] = stored.split('.');
			if (version !== 'v1') throw new Error('Unknown vault cipher version');
			const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64url'));
			decipher.setAuthTag(Buffer.from(tag, 'base64url'));
			return Buffer.concat([
				decipher.update(Buffer.from(data, 'base64url')),
				decipher.final()
			]).toString('utf8');
		}
	};
}
