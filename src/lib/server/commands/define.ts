import type { z } from 'zod';
import type { Actor } from '$lib/modules/kernel/domain/actor';

export interface Command<S extends z.ZodType = z.ZodType, O = unknown> {
	input: S;
	run: (actor: Actor, input: z.output<S>) => Promise<O>;
}

export const defineCommand = <S extends z.ZodType, O>(
	input: S,
	run: (actor: Actor, input: z.output<S>) => Promise<O>
): Command<S, O> => ({ input, run });
