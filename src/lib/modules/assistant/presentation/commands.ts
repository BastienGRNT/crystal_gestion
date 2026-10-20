import { z } from 'zod';
import { command, id } from '$lib/server/commands/define';
import { ACTION_KEYS } from '../domain/actions';
import type { OpCommand } from '../domain/ops';
import type { Assistant } from '../index';

const op = z.object({
	id: z.string().max(64),
	command: z.string().max(64),
	ref: z.string().max(32),
	input: z.record(z.string(), z.unknown()),
	reason: z.string().max(1000),
	sources: z.array(z.string().max(200)).max(10)
});

export const assistantCommands = (assistant: Assistant) => ({
	'assistant.ask': command(
		z.object({
			projectId: id,
			action: z.enum(ACTION_KEYS),
			targetId: id.nullable(),
			answers: z
				.array(z.object({ question: z.string().max(400), answer: z.string().max(1000) }))
				.max(6),
			previous: z
				.object({
					summary: z.string().max(10_000),
					verdict: z.string().max(20),
					questions: z.array(z.unknown()).max(6),
					ops: z.array(op).max(40),
					dropped: z.number()
				})
				.nullable(),
			remark: z.string().max(1000).nullable()
		}),
		({ userId }, input) =>
			assistant.ask(
				{
					...input,
					previous: input.previous && {
						...input.previous,
						verdict: 'none',
						questions: [],
						ops: input.previous.ops.map((o) => ({ ...o, command: o.command as OpCommand }))
					}
				},
				userId
			)
	)
});
