import { beforeEach, describe, expect, it } from 'vitest';
import { FixedClock, RecordingActivity, RecordingFeed, testId } from '../../kernel/testing';
import type { VaultEntry } from '../domain/entry';
import { validUrl } from '../domain/entry';
import { aesCipher } from '../infrastructure/aes-cipher';
import { createVault } from '../index';

function setup() {
	const rows = new Map<string, { entry: VaultEntry; cipher: string | null }>();
	const vault = createVault({
		clock: new FixedClock(),
		feed: new RecordingFeed<VaultEntry>(),
		activity: new RecordingActivity(),
		cipher: aesCipher('test-secret'),
		projectExists: async (id) => id === 'p1',
		vault: {
			list: async () => [...rows.values()].map((r) => r.entry),
			get: async (id) => rows.get(id) ?? null,
			insert: async (entry, cipher) => void rows.set(entry.id, { entry, cipher }),
			save: async (entry, cipher) =>
				void rows.set(entry.id, {
					entry,
					cipher: cipher === undefined ? rows.get(entry.id)!.cipher : cipher
				}),
			delete: async (id) => void rows.delete(id)
		}
	});
	return { vault, rows };
}

const stripe = {
	projectId: 'p1',
	name: 'Stripe',
	url: 'dashboard.stripe.com',
	username: 'ana@crystal.test',
	notes: ''
};

describe('vault', () => {
	let ctx: ReturnType<typeof setup>;
	beforeEach(() => (ctx = setup()));

	it('stores secrets encrypted and reveals them on demand', async () => {
		const entry = await ctx.vault.create({ ...stripe, id: testId(), secret: 'sk_live_123' }, 'ana');
		expect(entry).toMatchObject({ hasSecret: true, url: 'https://dashboard.stripe.com/' });
		expect(ctx.rows.get(entry.id)!.cipher).not.toContain('sk_live_123');
		expect(await ctx.vault.reveal(entry.id)).toEqual({ secret: 'sk_live_123' });
	});

	it('keeps the secret unless told otherwise', async () => {
		const entry = await ctx.vault.create({ ...stripe, id: testId(), secret: 'abc' }, 'ana');
		await ctx.vault.update(entry.id, { name: 'Stripe (prod)' });
		expect(await ctx.vault.reveal(entry.id)).toEqual({ secret: 'abc' });
		const cleared = await ctx.vault.update(entry.id, { secret: null });
		expect(cleared.hasSecret).toBe(false);
		expect(await ctx.vault.reveal(entry.id)).toEqual({ secret: null });
	});

	it('accepts plain links without credentials', async () => {
		const entry = await ctx.vault.create(
			{
				...stripe,
				id: testId(),
				name: 'Maquettes',
				url: 'figma.com/file/x',
				username: '',
				secret: ''
			},
			'ana'
		);
		expect(entry).toMatchObject({ hasSecret: false, username: null });
	});

	it('refuses links that are not web pages', () => {
		expect(() => validUrl('javascript:alert(1)')).toThrow();
		expect(() => validUrl('ftp://serveur')).toThrow(/web/);
	});
});
