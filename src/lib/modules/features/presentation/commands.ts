import { z } from 'zod';
import { defineCommand } from '$lib/server/commands/define';
import { id, projectScoped, text, title } from '$lib/server/commands/schemas';
import { MOSCOW } from '../domain/feature';
import type { FeaturesModule } from '..';

const fields = z.object({
	title,
	description: text(),
	priority: z.enum(MOSCOW),
	ownerId: id.nullable(),
	doneCriteria: text()
});

export const featureCommands = (features: FeaturesModule) => ({
	'features.create': defineCommand(
		projectScoped.extend(fields.partial().shape).extend({ title }),
		(actor, input) => features.create(actor, input)
	),
	'features.update': defineCommand(
		projectScoped.extend({ id, changes: fields.partial() }),
		(actor, input) => features.update(actor, input)
	),
	'features.delete': defineCommand(projectScoped.extend({ id }), (actor, input) =>
		features.remove(actor, input)
	)
});
