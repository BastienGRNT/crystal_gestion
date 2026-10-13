import { z } from 'zod';
import { command, dateKey, id } from '$lib/server/commands/define';
import type { Projects } from '../index';

export const projectCommands = (projects: Projects) => ({
	'projects.create': command(
		z.object({
			id,
			name: z.string(),
			description: z.string().optional(),
			color: z.number().int().optional(),
			deadline: dateKey.nullable().optional()
		}),
		({ userId }, input) => projects.create(input, userId)
	),
	'projects.update': command(
		z.object({
			id,
			name: z.string().optional(),
			description: z.string().optional(),
			color: z.number().int().optional(),
			deadline: dateKey.nullable().optional()
		}),
		(_, { id, ...patch }) => projects.update(id, patch)
	),
	'projects.archive': command(z.object({ id, archived: z.boolean() }), (_, input) =>
		projects.setArchived(input.id, input.archived)
	)
});
