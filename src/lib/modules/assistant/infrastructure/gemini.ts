import { ApiError, FinishReason, GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { DomainError, invalid } from '../../kernel/domain/errors';
import type { LlmClient, LlmRequest } from '../application/ports';
import { PROVIDERS } from '../domain/pricing';
import { ProposalSchema } from './proposal-schema';

// The schema Gemini follows; the answer is still checked with zod, then op by op.
const { $schema: _, ...responseJsonSchema } = z.toJSONSchema(ProposalSchema) as Record<
	string,
	unknown
>;

/**
 * One call per ask, on Gemini. Its free tier costs nothing but is limited (requests per
 * minute and per day) and lets Google read and reuse what is sent; `free: false` once the
 * key's project has billing turned on. Gemini caches repeated prefixes on its own: the rules
 * and the project context come first, the ask last.
 */
export function geminiClient(
	apiKey: () => string | undefined,
	free: boolean,
	largeModel: string | undefined = undefined
): LlmClient {
	const modelOf = (size: 'small' | 'large') =>
		size === 'large' && largeModel ? largeModel : PROVIDERS.gemini[size].id;
	let client: GoogleGenAI | null = null;
	// A busy model (503) often answers a second later: a few quick retries. Each call has its
	// own deadline, well under the reverse proxy's (60 s), so the screen never waits for nothing.
	const get = () =>
		(client ??= new GoogleGenAI({
			apiKey: apiKey(),
			httpOptions: { timeout: CALL_TIMEOUT_MS, retryOptions: { attempts: 3, initialDelay: 1 } }
		}));

	async function call(
		{ size, system, context, request, maxTokens }: LlmRequest,
		abortSignal: AbortSignal
	) {
		const response = await get().models.generateContent({
			model: modelOf(size),
			contents: [
				{ role: 'user', parts: [{ text: context }] },
				{ role: 'user', parts: [{ text: request }] }
			],
			config: {
				systemInstruction: system,
				maxOutputTokens: maxTokens,
				responseMimeType: 'application/json',
				responseJsonSchema,
				abortSignal
			}
		});
		const finish = response.candidates?.[0]?.finishReason;
		if (response.promptFeedback?.blockReason || finish === FinishReason.SAFETY)
			throw invalid(
				'Le chef de projet IA a refusé cette demande. Reformule-la ou fais-le à la main.'
			);
		const parsed = ProposalSchema.safeParse(parseJson(response.text));
		if (finish === FinishReason.MAX_TOKENS || !parsed.success)
			throw invalid(
				'La réponse du chef de projet IA était incomplète. Réessaie avec une demande plus courte.'
			);
		const u = response.usageMetadata;
		return {
			raw: parsed.data,
			model: response.modelVersion ?? modelOf(size),
			usage: {
				input: (u?.promptTokenCount ?? 0) - (u?.cachedContentTokenCount ?? 0),
				output: (u?.candidatesTokenCount ?? 0) + (u?.thoughtsTokenCount ?? 0),
				cacheWrite: 0,
				cacheRead: u?.cachedContentTokenCount ?? 0
			}
		};
	}

	return {
		configured: () => !!apiKey(),
		billing: { provider: 'gemini', free },
		async propose(input) {
			// One deadline for the whole ask, retries and fallback included.
			const deadline = AbortSignal.timeout(TOTAL_TIMEOUT_MS);
			try {
				return await call(input, deadline);
			} catch (error) {
				console.error('[assistant] Gemini', modelOf(input.size), describe(error));
				const other = input.size === 'small' ? 'large' : 'small';
				if (!overloaded(error) || modelOf(other) === modelOf(input.size)) throw readable(error);
				// Still overloaded: the other model is often available.
				try {
					return await call({ ...input, size: other }, deadline);
				} catch (retry) {
					console.error('[assistant] Gemini', modelOf(other), describe(retry));
					throw readable(retry);
				}
			}
		}
	};
}

const CALL_TIMEOUT_MS = 40_000;
const TOTAL_TIMEOUT_MS = 50_000;

const timedOut = (error: unknown) =>
	(error instanceof Error && (error.name === 'AbortError' || error.name === 'TimeoutError')) ||
	(error instanceof ApiError && error.status === 504);

const overloaded = (error: unknown) =>
	error instanceof ApiError && [500, 502, 503, 504].includes(error.status);

const describe = (error: unknown) =>
	error instanceof ApiError
		? `${error.status} ${error.message.slice(0, 300)}`
		: error instanceof Error
			? error.message
			: String(error);

function parseJson(text: string | undefined): unknown {
	try {
		return JSON.parse(text ?? '');
	} catch {
		return null;
	}
}

/** The API's errors, said in words the team can act on. */
function readable(error: unknown) {
	if (error instanceof DomainError) return error;
	if (timedOut(error))
		return invalid(
			'Gemini met trop de temps à répondre en ce moment (offre gratuite). Réessaie dans une minute.'
		);
	if (!(error instanceof ApiError)) return error;
	if (error.status === 429)
		return invalid(
			'La limite gratuite de Gemini est atteinte pour l’instant : réessaie dans une minute (ou demain si c’est la limite du jour).'
		);
	if (error.status === 400 && /api key/i.test(error.message))
		return invalid('La clé Gemini est refusée : vérifie GEMINI_API_KEY sur le serveur.');
	if (error.status === 401 || error.status === 403)
		return invalid('La clé Gemini est refusée : vérifie GEMINI_API_KEY sur le serveur.');
	if (overloaded(error))
		return invalid(
			'Gemini est surchargé en ce moment (offre gratuite) : réessaie dans une minute.'
		);
	if (error.status === 400)
		return invalid(
			'Le chef de projet IA n’a pas compris la demande. Réessaie, ou fais-le à la main.'
		);
	return invalid('Le chef de projet IA ne répond pas pour l’instant. Réessaie plus tard.');
}
