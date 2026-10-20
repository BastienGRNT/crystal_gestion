import { z } from 'zod';
import {
	LEVELS,
	STAKEHOLDER_ROLES,
	STRATEGY_KINDS,
	SWOT_QUADRANTS
} from '../../framing/domain/framing';
import { BRIEF_HEADINGS, TECH_HEADINGS } from '../../projects/domain/project';
import { DIRECTIONS } from '../../roadmap/domain/metric';
import { QUADRANTS, TASK_KINDS } from '../../tasks/domain/task';

/**
 * What the assistant may propose: a white list of existing commands, each with only the fields
 * it may touch. Never a deletion, the vault, who does what, nor a task started or finished; a
 * step date never moves without its "why". An item created by an op can be pointed at by a
 * later op of the same proposal with `$ref` (its `ref`), resolved when the ops are applied.
 */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const REF = /^\$[a-z0-9_-]{1,24}$/i;
export const isRef = (value: unknown): value is string =>
	typeof value === 'string' && REF.test(value);

const link = z.string().refine((v) => UUID.test(v) || REF.test(v), 'Lien invalide.');
const text = (max: number) => z.string().trim().min(1).max(max);
const longText = (max: number) => z.string().max(max);
const dateKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
/** A task proposed by the assistant goes to the ideas or to do, never further. */
const plannedStatus = z.enum(['idea', 'todo']);

const taskFields = {
	title: text(200),
	notes: longText(4000),
	kind: z.enum(TASK_KINDS),
	status: plannedStatus,
	componentId: link.nullable(),
	milestoneId: link.nullable(),
	dueDate: dateKey.nullable(),
	quadrant: z.enum(QUADRANTS).nullable(),
	checklist: z.array(text(200)).max(12),
	storyId: link.nullable(),
	epicId: link.nullable()
};

const criterion = z.object({
	text: text(300),
	data: longText(1000).default(''),
	expected: longText(500).default('')
});

export const OP_SCHEMAS = {
	'tasks.create': z.object(taskFields).partial().required({ title: true }).strict(),
	'tasks.update': z
		.object({ id: link, ...taskFields })
		.partial()
		.required({ id: true })
		.strict(),
	'chat.comment': z.object({ taskId: link, body: text(2000) }).strict(),
	'roadmap.createMilestone': z
		.object({
			title: text(80),
			doneWhen: longText(1000).optional(),
			targetDate: dateKey.nullable().optional(),
			componentId: link.nullable().optional()
		})
		.strict(),
	'roadmap.updateMilestone': z
		.object({
			id: link,
			title: text(80).optional(),
			doneWhen: longText(1000).optional(),
			targetDate: dateKey.nullable().optional(),
			reason: longText(500).optional()
		})
		.strict()
		.refine((m) => m.targetDate === undefined || !!m.reason?.trim(), {
			message: 'Une date qui bouge a besoin de son pourquoi.'
		}),
	'roadmap.createDecision': z
		.object({
			text: text(280),
			why: longText(500).optional(),
			taskId: link.nullable().optional(),
			milestoneId: link.nullable().optional()
		})
		.strict(),
	'roadmap.createHypothesis': z.object({ text: text(140) }).strict(),
	'roadmap.createMetric': z
		.object({
			name: text(60),
			unit: longText(20).optional(),
			target: z.number().finite().nullable().optional(),
			direction: z.enum(DIRECTIONS).optional()
		})
		.strict(),
	'project.brief': z.object({ section: z.enum(BRIEF_HEADINGS), text: longText(4000) }).strict(),
	'project.techSpec': z.object({ section: z.enum(TECH_HEADINGS), text: longText(8000) }).strict(),
	'components.create': z.object({ name: text(30), parentId: link.nullable().optional() }).strict(),
	'framing.createStakeholder': z
		.object({
			name: text(80),
			organization: longText(80).optional(),
			role: z.enum(STAKEHOLDER_ROLES).optional(),
			influence: z.enum(LEVELS).optional(),
			interest: z.enum(LEVELS).optional(),
			expects: longText(1000).optional()
		})
		.strict(),
	'framing.createInitiative': z
		.object({ title: text(120), why: longText(1000).optional() })
		.strict(),
	'framing.createEpic': z
		.object({
			title: text(120),
			description: longText(4000).optional(),
			initiativeId: link.nullable().optional(),
			componentId: link.nullable().optional()
		})
		.strict(),
	'framing.createStory': z
		.object({
			want: text(300),
			soThat: longText(300).optional(),
			epicId: link.nullable().optional(),
			personaId: link.nullable().optional(),
			criteria: z.array(criterion).max(12).optional()
		})
		.strict(),
	'framing.updateStory': z
		.object({
			id: link,
			want: text(300).optional(),
			soThat: longText(300).optional(),
			criteria: z.array(criterion).max(12).optional()
		})
		.strict(),
	'framing.createSwotItem': z
		.object({ quadrant: z.enum(SWOT_QUADRANTS), text: text(160) })
		.strict(),
	'framing.createStrategy': z
		.object({
			kind: z.enum(STRATEGY_KINDS),
			text: text(200),
			itemIds: z.array(link).max(6).optional()
		})
		.strict(),
	'framing.createTerm': z.object({ term: text(60), definition: longText(600) }).strict(),
	'framing.createJourney': z.object({ title: text(120), body: longText(8000) }).strict()
} as const;

export type OpCommand = keyof typeof OP_SCHEMAS;
export const OP_COMMANDS = Object.keys(OP_SCHEMAS) as OpCommand[];
export type OpInput<C extends OpCommand> = z.output<(typeof OP_SCHEMAS)[C]>;

/** Ops that create something another op can point at with `$ref`. */
export const CREATING: ReadonlySet<OpCommand> = new Set([
	'tasks.create',
	'roadmap.createMilestone',
	'roadmap.createHypothesis',
	'roadmap.createMetric',
	'components.create',
	'framing.createStakeholder',
	'framing.createInitiative',
	'framing.createEpic',
	'framing.createStory',
	'framing.createSwotItem',
	'framing.createStrategy',
	'framing.createTerm',
	'framing.createJourney'
]);
