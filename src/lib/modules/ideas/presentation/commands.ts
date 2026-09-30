import { z } from 'zod';
import { defineCommand } from '$lib/server/commands/define';
import { id, projectScoped, text, title } from '$lib/server/commands/schemas';
import type { IdeasModule } from '..';

const target = projectScoped.extend({ id });
const fields = z.object({ title, note: text(), featureId: id.nullable() });

export const ideaCommands = (ideas: IdeasModule) => ({
	'ideas.create': defineCommand(
		projectScoped.extend({
			title,
			note: text().default(''),
			featureId: id.nullable().default(null)
		}),
		(actor, input) => ideas.create(actor, { ...input, archivedAt: null, triagedAt: null })
	),
	'ideas.update': defineCommand(target.extend({ changes: fields.partial() }), (actor, input) =>
		ideas.update(actor, input)
	),
	'ideas.archive': defineCommand(target.extend({ archived: z.boolean() }), (actor, input) =>
		ideas.archive(actor, input)
	),
	'ideas.keep': defineCommand(target, (actor, input) => ideas.keep(actor, input)),
	'ideas.toTask': defineCommand(target, (actor, input) => ideas.convertToTask(actor, input)),
	'ideas.toFeature': defineCommand(target, (actor, input) => ideas.convertToFeature(actor, input)),
	'ideas.delete': defineCommand(target, (actor, input) => ideas.remove(actor, input))
});
