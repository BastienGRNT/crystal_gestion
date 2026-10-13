import { z } from 'zod';
import { command, id } from '$lib/server/commands/define';
import type { Files } from '../index';

// Uploads and downloads stream through /api/files; only metadata goes through commands.
export const fileCommands = (files: Files) => ({
	'files.update': command(
		z.object({ id, name: z.string().optional(), folderId: id.nullable().optional() }),
		({ userId }, { id, ...patch }) => files.update(id, patch, userId)
	),
	'files.delete': command(z.object({ id }), ({ userId }, input) => files.delete(input.id, userId)),
	'folders.create': command(
		z.object({ id, projectId: id, parentId: id.nullable(), name: z.string() }),
		({ userId }, input) => files.createFolder(input, userId)
	),
	'folders.update': command(
		z.object({ id, name: z.string().optional(), parentId: id.nullable().optional() }),
		({ userId }, { id, ...patch }) => files.updateFolder(id, patch, userId)
	),
	'folders.delete': command(z.object({ id }), ({ userId }, input) =>
		files.deleteFolder(input.id, userId)
	)
});
