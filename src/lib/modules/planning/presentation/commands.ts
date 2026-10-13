import { z } from 'zod';
import { command, id } from '$lib/server/commands/define';
import type { Planning } from '../index';

const instant = z.iso.datetime({ offset: true });
const status = z.enum(['available', 'maybe']);
const slot = z.object({ id, startsAt: instant, endsAt: instant, status: status.optional() });

// Everyone edits their own time only: the user always comes from the session.
export const planningCommands = (planning: Planning) => ({
	'slots.create': command(slot, ({ userId }, input) => planning.createSlot(input, userId)),
	'slots.createMany': command(z.object({ slots: z.array(slot).max(60) }), ({ userId }, input) =>
		planning.createSlots(input.slots, userId)
	),
	'slots.update': command(
		z.object({
			id,
			startsAt: instant.optional(),
			endsAt: instant.optional(),
			status: status.optional()
		}),
		({ userId }, { id, ...patch }) => planning.updateSlot(id, patch, userId)
	),
	'slots.delete': command(z.object({ id }), ({ userId }, input) =>
		planning.deleteSlot(input.id, userId)
	),
	'blocks.create': command(
		z.object({
			id,
			projectId: id,
			taskId: id.nullable().optional(),
			startsAt: instant,
			endsAt: instant
		}),
		({ userId }, input) => planning.createBlock(input, userId)
	),
	'blocks.update': command(
		z.object({
			id,
			taskId: id.nullable().optional(),
			startsAt: instant.optional(),
			endsAt: instant.optional()
		}),
		({ userId }, { id, ...patch }) => planning.updateBlock(id, patch, userId)
	),
	'blocks.delete': command(z.object({ id }), ({ userId }, input) =>
		planning.deleteBlock(input.id, userId)
	)
});
