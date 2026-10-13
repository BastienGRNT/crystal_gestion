import { building, dev } from '$app/environment';
import { env } from '$env/dynamic/private';

let warned = false;

export const config = {
	databaseUrl() {
		if (!env.DATABASE_URL && !building) throw new Error('DATABASE_URL is not set');
		return env.DATABASE_URL ?? '';
	},
	storageDir: () => env.STORAGE_DIR || './data/storage',
	/** Encrypts the vault. Required in production: losing it means losing the stored passwords. */
	appSecret() {
		if (env.APP_SECRET) return env.APP_SECRET;
		if (!dev) throw new Error('APP_SECRET is not set (openssl rand -base64 32)');
		if (!warned) console.warn('[crystal] APP_SECRET is not set: using an insecure dev key.');
		warned = true;
		return 'crystal-insecure-dev-secret';
	}
};
