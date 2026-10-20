import { resolveAliases } from './context';
import { CREATING, OP_SCHEMAS, isRef, type OpCommand } from './ops';

/** A multiple-choice question, with the answer the assistant would pick, and room for more. */
export interface Question {
	text: string;
	options: string[];
	suggested: string;
}

export interface Op<C extends OpCommand = OpCommand> {
	/** Its own id in the proposal, to tick, edit or drop it. */
	id: string;
	command: C;
	/** A name other ops use to point at what this one creates (`$e1`). Empty when none. */
	ref: string;
	input: Record<string, unknown>;
	reason: string;
	/** Where it comes from: `#12`, a dated decision, a section of the framing note, a message. */
	sources: string[];
}

export const VERDICTS = ['none', 'realistic', 'at_risk', 'unrealistic'] as const;
export type Verdict = (typeof VERDICTS)[number];

export interface Proposal {
	summary: string;
	verdict: Verdict;
	questions: Question[];
	ops: Op[];
	/** Ops the assistant wrote that broke a rule: dropped, and said. */
	dropped: number;
}

/** The raw shape the model answers with: inputs come as JSON text, checked op by op. */
export interface RawProposal {
	summary: string;
	verdict: Verdict;
	questions: Question[];
	ops: { command: string; ref: string; input: string; reason: string; sources: string[] }[];
}

/** Rules of the system prompt the code enforces too, whatever the model wrote. */
export const LIMITS = { ops: 30, newTasks: 15, hypotheses: 3, metrics: 5, questions: 4 };

function parseInput(
	command: OpCommand,
	json: string,
	aliases: Map<string, string>
): Record<string, unknown> | null {
	let value: unknown;
	try {
		value = JSON.parse(json);
	} catch {
		return null;
	}
	if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
	const parsed = OP_SCHEMAS[command].safeParse(
		resolveAliases(value as Record<string, unknown>, aliases)
	);
	return parsed.success ? (parsed.data as Record<string, unknown>) : null;
}

/** Every `$ref` an input points at must be created by an earlier op of the proposal. */
function refsKnown(input: Record<string, unknown>, known: Set<string>): boolean {
	const values = Object.values(input).flatMap((v) => (Array.isArray(v) ? v : [v]));
	return values.filter(isRef).every((ref) => known.has(ref.slice(1)));
}

/**
 * Keeps what the white list allows, within the limits; drops the rest and counts it. The
 * assistant proposes, the team decides: nothing here is ever applied without a click.
 */
export function cleanProposal(
	raw: RawProposal,
	options: { allowed: readonly OpCommand[]; aliases: Map<string, string>; newId: () => string }
): Proposal {
	const { allowed, aliases, newId } = options;
	const known = new Set<string>();
	const count: Partial<Record<OpCommand, number>> = {};
	const caps: Partial<Record<OpCommand, number>> = {
		'tasks.create': LIMITS.newTasks,
		'roadmap.createHypothesis': LIMITS.hypotheses,
		'roadmap.createMetric': LIMITS.metrics
	};
	const ops: Op[] = [];
	for (const op of raw.ops.slice(0, LIMITS.ops)) {
		if (!allowed.includes(op.command as OpCommand)) continue;
		const command = op.command as OpCommand;
		const input = parseInput(command, op.input, aliases);
		if (!input || !refsKnown(input, known)) continue;
		count[command] = (count[command] ?? 0) + 1;
		if (count[command]! > (caps[command] ?? Infinity)) continue;
		const ref = CREATING.has(command) && /^[a-z0-9_-]{1,24}$/i.test(op.ref) ? op.ref : '';
		if (ref) known.add(ref);
		ops.push({
			id: newId(),
			command,
			ref,
			input,
			reason: op.reason.slice(0, 500),
			sources: op.sources.slice(0, 8).map((s) => s.slice(0, 120))
		});
	}
	return {
		summary: raw.summary.slice(0, 6000),
		verdict: raw.verdict,
		questions: raw.questions.slice(0, LIMITS.questions).map((q) => ({
			text: q.text.slice(0, 300),
			options: q.options.slice(0, 6).map((o) => o.slice(0, 200)),
			suggested: q.suggested.slice(0, 200)
		})),
		ops,
		dropped: raw.ops.length - ops.length
	};
}
