/**
 * Who answers, and what it costs. Each provider has a small model for the frequent, short asks
 * (rephrasing a task, sorting) and a larger one for what needs judgment (cutting a step, the
 * framing). Prices in US dollars per million tokens: tokens × price = micro-dollars. On a free
 * tier, nothing is paid: Google's own limits (requests per minute and per day) apply instead.
 */
export const PROVIDERS = {
	gemini: {
		label: 'Gemini',
		small: { id: 'gemini-3.5-flash-lite', input: 0.3, output: 2.5, cacheWrite: 0, cacheRead: 0.03 },
		large: { id: 'gemini-3.8-flash', input: 0.75, output: 3.75, cacheWrite: 0, cacheRead: 0.075 }
	},
	anthropic: {
		label: 'Claude',
		small: { id: 'claude-haiku-5-5', input: 0.1, output: 0.5, cacheWrite: 0.125, cacheRead: 0.01 },
		large: { id: 'claude-sonnet-5-5', input: 2, output: 10, cacheWrite: 2.5, cacheRead: 0.2 }
	}
} as const;

export type Provider = keyof typeof PROVIDERS;
export const PROVIDER_KEYS = Object.keys(PROVIDERS) as Provider[];
export type ModelSize = 'small' | 'large';

/** The provider in use on a server, as the screens need to know it. */
export interface Billing {
	provider: Provider;
	/** Free tier: costs nothing, but the provider may read and reuse what is sent. */
	free: boolean;
}

export interface Usage {
	input: number;
	output: number;
	cacheWrite: number;
	cacheRead: number;
}

export const modelId = (billing: Billing, size: ModelSize) => PROVIDERS[billing.provider][size].id;

/** What a call cost, in micro-dollars (millionths of a dollar), rounded up. */
export function costMicros(billing: Billing, size: ModelSize, usage: Usage): number {
	if (billing.free) return 0;
	const p = PROVIDERS[billing.provider][size];
	return Math.ceil(
		usage.input * p.input +
			usage.output * p.output +
			usage.cacheWrite * p.cacheWrite +
			usage.cacheRead * p.cacheRead
	);
}

/** Before asking: the context read once, and about half the room to answer used. */
export const estimateMicros = (
	billing: Billing,
	size: ModelSize,
	contextTokens: number,
	maxTokens: number
) =>
	costMicros(billing, size, {
		input: contextTokens,
		output: maxTokens / 2,
		cacheWrite: 0,
		cacheRead: 0
	});

/** "moins d’un centime", "≈ 3 centimes" (of a dollar): what a person can weigh at a glance. */
export function costLabel(micros: number): string {
	const cents = micros / 10_000;
	if (!micros) return '0 centime';
	if (cents < 1) return 'moins d’un centime';
	return `≈ ${Math.round(cents)} centime${Math.round(cents) > 1 ? 's' : ''}`;
}

/** A month's budget per project, unless the environment sets another. */
export const DEFAULT_QUOTA = { requests: 300, micros: 5_000_000 };
