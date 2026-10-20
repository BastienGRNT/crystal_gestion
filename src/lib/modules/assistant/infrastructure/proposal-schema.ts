import { z } from 'zod';
import { VERDICTS } from '../domain/proposal';

/** The answer's shape, asked of every provider. Op inputs come as JSON text, checked op by op. */
export const ProposalSchema = z.object({
	summary: z.string(),
	verdict: z.enum(VERDICTS),
	questions: z.array(
		z.object({ text: z.string(), options: z.array(z.string()), suggested: z.string() })
	),
	ops: z.array(
		z.object({
			command: z.string(),
			ref: z.string(),
			input: z.string(),
			reason: z.string(),
			sources: z.array(z.string())
		})
	)
});
