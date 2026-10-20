import { building, dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { DEFAULT_QUOTA } from '$lib/modules/assistant/domain/pricing';

let warned = false;

export const config = {
	databaseUrl() {
		if (!env.DATABASE_URL && !building) throw new Error('DATABASE_URL is not set');
		return env.DATABASE_URL ?? '';
	},
	storageDir: () => env.STORAGE_DIR || './data/storage',
	/** The AI project manager: off without a key. */
	anthropicKey: () => env.ANTHROPIC_API_KEY || undefined,
	geminiKey: () => env.GEMINI_API_KEY || undefined,
	/** `gemini` or `anthropic`; without it, the first key set (Gemini first: it has a free tier). */
	aiProvider(): 'gemini' | 'anthropic' {
		if (env.AI_PROVIDER === 'anthropic' || env.AI_PROVIDER === 'gemini') return env.AI_PROVIDER;
		return env.GEMINI_API_KEY || !env.ANTHROPIC_API_KEY ? 'gemini' : 'anthropic';
	},
	/** Gemini's free tier until the key's project has billing on (`GEMINI_PAID=1`). */
	geminiFree: () => env.GEMINI_PAID !== '1',
	/** Per project and per month; the defaults keep a small team well under 5 $. */
	aiQuota: () => ({
		requests: Number(env.AI_MONTHLY_REQUESTS) || DEFAULT_QUOTA.requests,
		micros: Math.round((Number(env.AI_MONTHLY_BUDGET_USD) || DEFAULT_QUOTA.micros / 1e6) * 1e6)
	}),
	/** Encrypts the vault. Required in production: losing it means losing the stored passwords. */
	appSecret() {
		if (env.APP_SECRET) return env.APP_SECRET;
		if (!dev) throw new Error('APP_SECRET is not set (openssl rand -base64 32)');
		if (!warned) console.warn('[crystal] APP_SECRET is not set: using an insecure dev key.');
		warned = true;
		return 'crystal-insecure-dev-secret';
	}
};
