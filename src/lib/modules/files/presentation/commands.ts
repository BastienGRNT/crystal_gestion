import { z } from 'zod';
import { command, id } from '$lib/server/commands/define';
import type { Files } from '../index';

// Uploads and downloads stream through /api/files; only metadata goes through commands.
export const fileCommands = (files: Files) => ({
	'files.rename': command(z.object({ id, name: z.string() }), (_, input) =>
		files.rename(input.id, input.name)
	),
	'files.delete': command(z.object({ id }), (_, input) => files.delete(input.id))
});
