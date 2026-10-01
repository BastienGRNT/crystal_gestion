import { z } from 'zod';
import { defineCommand } from '$lib/server/commands/define';
import { id, projectScoped, title } from '$lib/server/commands/schemas';
import type { FilesModule } from '..';

const target = projectScoped.extend({ id });
const name = z.string().max(120);

/** Uploads go through a multipart endpoint; everything else is a regular command. */
export const fileCommands = (files: FilesModule) => ({
	'files.update': defineCommand(
		target.extend({
			changes: z.object({ title, featureId: id.nullable(), folderId: id.nullable() }).partial()
		}),
		(actor, input) => files.update(actor, input)
	),
	'files.delete': defineCommand(target, (actor, input) => files.remove(actor, input)),
	'folders.create': defineCommand(
		projectScoped.extend({ featureId: id.nullable(), parentId: id.nullable(), name }),
		(actor, input) => files.folders.create(actor, input)
	),
	'folders.rename': defineCommand(target.extend({ name }), (actor, input) =>
		files.folders.rename(actor, input)
	),
	'folders.delete': defineCommand(target, (actor, input) => files.folders.remove(actor, input))
});
