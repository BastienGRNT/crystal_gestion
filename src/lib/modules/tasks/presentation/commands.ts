import { z } from 'zod';
import { defineCommand } from '$lib/server/commands/define';
import { dateKey, id, projectScoped, text, title } from '$lib/server/commands/schemas';
import { TASK_STATUSES } from '../domain/task';
import type { TasksModule } from '..';

const fields = z.object({
	title,
	description: text(),
	featureId: id.nullable(),
	dueDate: dateKey.nullable(),
	important: z.boolean().nullable(),
	urgent: z.boolean().nullable(),
	assigneeIds: z.array(id),
	isFix: z.boolean()
});
const target = projectScoped.extend({ id });
const status = z.enum(TASK_STATUSES);

export const taskCommands = (tasks: TasksModule) => ({
	'tasks.create': defineCommand(
		projectScoped
			.extend(fields.partial().shape)
			.extend({ title, status: status.optional(), position: z.number().optional() }),
		(actor, input) => tasks.create(actor, input)
	),
	'tasks.update': defineCommand(target.extend({ changes: fields.partial() }), (actor, input) =>
		tasks.update(actor, input)
	),
	'tasks.move': defineCommand(
		target.extend({ status, position: z.number().optional() }),
		(actor, input) => tasks.move(actor, input)
	),
	'tasks.delete': defineCommand(target, (actor, input) => tasks.remove(actor, input)),
	'tasks.start': defineCommand(target, (actor, input) => tasks.start(actor, input)),
	'tasks.pause': defineCommand(z.object({}), (actor) => tasks.pause(actor)),
	'tasks.finish': defineCommand(target, (actor, input) => tasks.finish(actor, input))
});
