import { z } from 'zod';
import { command, dateKey, id, quadrant, status } from '$lib/server/commands/define';
import type { Tasks } from '../index';

const editable = {
	title: z.string(),
	notes: z.string(),
	status,
	quadrant,
	assigneeId: id.nullable(),
	dueDate: dateKey.nullable(),
	position: z.number().finite()
};

export const taskCommands = (tasks: Tasks) => ({
	'tasks.create': command(
		z.object({ id, projectId: id, ...editable }).partial({
			notes: true,
			status: true,
			quadrant: true,
			assigneeId: true,
			dueDate: true,
			position: true
		}),
		({ userId }, input) => tasks.create(input, userId)
	),
	// No defaults here: an update only touches the fields it sends.
	'tasks.update': command(
		z
			.object({ id, ...editable })
			.partial()
			.required({ id: true }),
		({ userId }, { id, ...patch }) => tasks.update(id, patch, userId)
	),
	'tasks.delete': command(z.object({ id }), (_, input) => tasks.delete(input.id))
});
