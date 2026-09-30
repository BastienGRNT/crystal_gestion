import { z } from 'zod';
import { defineCommand } from '$lib/server/commands/define';
import { id, projectScoped, title } from '$lib/server/commands/schemas';
import type { FilesModule } from '..';

const target = projectScoped.extend({ id });

/** Uploads go through a multipart endpoint; everything else is a regular command. */
export const fileCommands = (files: FilesModule) => ({
	'files.update': defineCommand(
		target.extend({ changes: z.object({ title, featureId: id.nullable() }).partial() }),
		(actor, input) => files.update(actor, input)
	),
	'files.delete': defineCommand(target, (actor, input) => files.remove(actor, input))
});
