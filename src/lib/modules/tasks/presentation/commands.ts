import { z } from 'zod';
import { command, dateKey, id, kind, quadrant, status } from '$lib/server/commands/define';
import type { Tasks } from '../index';

const checklist = z
	.array(z.object({ id: z.string().max(64), text: z.string(), done: z.boolean() }))
	.max(50);

const editable = {
	title: z.string(),
	notes: z.string(),
	status,
	kind,
	critical: z.boolean(),
	reportedBy: z.string().max(200).nullable(),
	quadrant,
	assigneeId: id.nullable(),
	reviewerId: id.nullable(),
	blockedReason: z.string().nullable(),
	checklist,
	dueDate: dateKey.nullable(),
	milestoneId: id.nullable(),
	componentId: id.nullable(),
	storyId: id.nullable(),
	epicId: id.nullable(),
	outsideProduct: z.boolean(),
	position: z.number().finite()
};

export const taskCommands = (tasks: Tasks) => ({
	'tasks.create': command(
		z
			.object({
				id,
				projectId: id,
				title: z.string(),
				notes: z.string(),
				status,
				kind,
				critical: z.boolean(),
				reportedBy: z.string().max(200).nullable(),
				quadrant,
				assigneeId: id.nullable(),
				checklist,
				dueDate: dateKey.nullable(),
				milestoneId: id.nullable(),
				componentId: id.nullable(),
				storyId: id.nullable(),
				epicId: id.nullable(),
				position: z.number().finite()
			})
			.partial({
				storyId: true,
				epicId: true,
				notes: true,
				status: true,
				kind: true,
				critical: true,
				reportedBy: true,
				componentId: true,
				quadrant: true,
				assigneeId: true,
				checklist: true,
				dueDate: true,
				milestoneId: true,
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
	'tasks.delete': command(z.object({ id }), ({ userId }, input) => tasks.delete(input.id, userId)),
	'components.create': command(
		z.object({
			id,
			projectId: id,
			name: z.string(),
			color: z.number().int().optional(),
			parentId: id.nullable().optional()
		}),
		({ userId }, input) => tasks.createComponent(input, userId)
	),
	'components.update': command(
		z
			.object({
				id,
				name: z.string(),
				description: z.string(),
				parentId: id.nullable(),
				color: z.number().int(),
				position: z.number().finite(),
				archived: z.boolean()
			})
			.partial()
			.required({ id: true }),
		({ userId }, { id, ...patch }) => tasks.updateComponent(id, patch, userId)
	),
	'components.delete': command(z.object({ id }), ({ userId }, input) =>
		tasks.deleteComponent(input.id, userId)
	)
});
