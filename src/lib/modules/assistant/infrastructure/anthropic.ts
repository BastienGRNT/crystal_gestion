import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { DomainError, invalid } from '../../kernel/domain/errors';
import type { LlmClient, LlmRequest } from '../application/ports';
import { PROVIDERS } from '../domain/pricing';
import { ProposalSchema } from './proposal-schema';

/**
 * One call per ask. The rules and the project context are cached (they repeat across the
 * buttons of a session); the ask itself comes last. The small model thinks little, the large
 * one a bit more. If the model declines, the API retries on its default fallback.
 */
export function anthropicClient(apiKey: () => string | undefined): LlmClient {
	let client: Anthropic | null = null;
	const get = () => (client ??= new Anthropic({ apiKey: apiKey(), maxRetries: 2 }));
	return {
		configured: () => !!apiKey(),
		billing: { provider: 'anthropic', free: false },
		async propose(input) {
			try {
				return await call(input);
			} catch (error) {
				throw readable(error);
			}
		}
	};

	async function call({ size, system, context, request, maxTokens }: LlmRequest) {
		const response = await get().beta.messages.parse({
			model: PROVIDERS.anthropic[size].id,
			max_tokens: maxTokens,
			betas: ['server-side-fallback-2026-07-01'],
			fallbacks: 'default',
			output_config: {
				effort: size === 'small' ? 'low' : 'medium',
				format: betaZodOutputFormat(ProposalSchema)
			},
			system: [
				{ type: 'text', text: system, cache_control: { type: 'ephemeral' } },
				{ type: 'text', text: context, cache_control: { type: 'ephemeral' } }
			],
			messages: [{ role: 'user', content: request }]
		});
		if (response.stop_reason === 'refusal')
			throw invalid(
				'Le chef de projet IA a refusé cette demande. Reformule-la ou fais-le à la main.'
			);
		if (response.stop_reason === 'max_tokens' || !response.parsed_output)
			throw invalid(
				'La réponse du chef de projet IA était incomplète. Réessaie avec une demande plus courte.'
			);
		const u = response.usage;
		return {
			raw: response.parsed_output,
			model: response.model,
			usage: {
				input: u.input_tokens,
				output: u.output_tokens,
				cacheWrite: u.cache_creation_input_tokens ?? 0,
				cacheRead: u.cache_read_input_tokens ?? 0
			}
		};
	}
}

/** The API's typed errors, said in words the team can act on. */
function readable(error: unknown) {
	if (error instanceof DomainError) return error;
	if (
		error instanceof Anthropic.AuthenticationError ||
		error instanceof Anthropic.PermissionDeniedError
	)
		return invalid(
			'La clé du chef de projet IA est refusée : vérifie ANTHROPIC_API_KEY sur le serveur.'
		);
	if (error instanceof Anthropic.RateLimitError)
		return invalid('Le chef de projet IA est très demandé : réessaie dans une minute.');
	if (error instanceof Anthropic.BadRequestError)
		return invalid(
			'Le chef de projet IA n’a pas compris la demande. Réessaie, ou fais-le à la main.'
		);
	if (error instanceof Anthropic.APIError || error instanceof Anthropic.APIConnectionError)
		return invalid('Le chef de projet IA ne répond pas pour l’instant. Réessaie plus tard.');
	return error;
}
