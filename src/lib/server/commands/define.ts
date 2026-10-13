import { z } from 'zod';
import { QUADRANTS, TASK_STATUSES } from '$lib/modules/tasks/domain/task';

export interface CommandContext {
	userId: string;
	sessionToken: string;
}

export interface Command<Schema extends z.ZodType, Result> {
	input: Schema;
	run(ctx: CommandContext, input: z.output<Schema>): Promise<Result>;
}

export const command = <Schema extends z.ZodType, Result>(
	input: Schema,
	run: (ctx: CommandContext, input: z.output<Schema>) => Promise<Result>
): Command<Schema, Result> => ({ input, run });

// Shapes reused by several modules. Business rules (lengths, formats) stay in the domain.
export const id = z.uuid();
export const text = z.string().max(50_000);
export const nullableText = text.nullable();
export const dateKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const status = z.enum(TASK_STATUSES);
export const quadrant = z.enum(QUADRANTS).nullable();
export const slots = z.array(z.object({ start: z.string(), end: z.string() })).max(24);
