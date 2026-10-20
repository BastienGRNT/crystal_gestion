/**
 * The two sizes of model the assistant uses: the small one for the frequent, short asks
 * (rephrasing a task, sorting), the larger one for what needs judgment (cutting a step, the
 * framing). Prices in US dollars per million tokens: tokens × price = micro-dollars.
 */
export const MODELS = {
	small: {
		id: 'claude-haiku-5-5',
		input: 0.1,
		output: 0.5,
		cacheWrite: 0.125,
		cacheRead: 0.01
	},
	large: {
		id: 'claude-sonnet-5-5',
		input: 2,
		output: 10,
		cacheWrite: 2.5,
		cacheRead: 0.2
	}
} as const;

export type ModelSize = keyof typeof MODELS;

export interface Usage {
	input: number;
	output: number;
	cacheWrite: number;
	cacheRead: number;
}

/** What a call cost, in micro-dollars (millionths of a dollar), rounded up. */
export function costMicros(size: ModelSize, usage: Usage): number {
	const p = MODELS[size];
	return Math.ceil(
		usage.input * p.input +
			usage.output * p.output +
			usage.cacheWrite * p.cacheWrite +
			usage.cacheRead * p.cacheRead
	);
}

/** Before asking: the context read once, and about half the room to answer used. */
export const estimateMicros = (size: ModelSize, contextTokens: number, maxTokens: number) =>
	costMicros(size, { input: contextTokens, output: maxTokens / 2, cacheWrite: 0, cacheRead: 0 });

/** "moins d’un centime", "≈ 3 centimes" (of a dollar): what a person can weigh at a glance. */
export function costLabel(micros: number): string {
	const cents = micros / 10_000;
	if (!micros) return '0 centime';
	if (cents < 1) return 'moins d’un centime';
	return `≈ ${Math.round(cents)} centime${Math.round(cents) > 1 ? 's' : ''}`;
}

/** A month's budget per project, unless the environment sets another. */
export const DEFAULT_QUOTA = { requests: 300, micros: 5_000_000 };
