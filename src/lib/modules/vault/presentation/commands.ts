import { z } from 'zod';
import { command, id } from '$lib/server/commands/define';
import type { Vault } from '../index';

const fields = {
	name: z.string(),
	url: z.string().nullable(),
	username: z.string().nullable(),
	notes: z.string(),
	secret: z.string().nullable()
};

export const vaultCommands = (vault: Vault) => ({
	'vault.create': command(
		z
			.object({ id, projectId: id, ...fields })
			.partial({ url: true, username: true, notes: true, secret: true }),
		({ userId }, input) =>
			vault.create({ url: null, username: null, notes: '', secret: null, ...input }, userId)
	),
	'vault.update': command(
		z
			.object({ id, ...fields })
			.partial()
			.required({ id: true }),
		({ userId }, { id, ...patch }) => vault.update(id, patch, userId)
	),
	'vault.delete': command(z.object({ id }), ({ userId }, input) => vault.delete(input.id, userId)),
	'vault.reveal': command(z.object({ id }), ({ userId }, input) => vault.reveal(input.id, userId))
});
