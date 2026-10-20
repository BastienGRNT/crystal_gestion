import { z } from 'zod';
import { command, id } from '$lib/server/commands/define';
import {
	INFORM_EVERY,
	LEVELS,
	STAKEHOLDER_ROLES,
	STRATEGY_KINDS,
	SWOT_QUADRANTS,
	TECH_LEVELS
} from '../domain/framing';
import type { Framing } from '../index';

const position = z.number().finite();
const criteria = z
	.array(
		z.object({
			id: z.string().max(64),
			text: z.string(),
			done: z.boolean(),
			data: z.string(),
			expected: z.string()
		})
	)
	.max(50);

const initiative = { title: z.string(), why: z.string(), metricId: id.nullable(), position };
const epic = {
	title: z.string(),
	description: z.string(),
	initiativeId: id.nullable(),
	componentId: id.nullable(),
	later: z.boolean(),
	position
};
const story = {
	epicId: id.nullable(),
	personaId: id.nullable(),
	want: z.string(),
	soThat: z.string(),
	criteria,
	position
};
const stakeholder = {
	name: z.string(),
	organization: z.string(),
	role: z.enum(STAKEHOLDER_ROLES),
	influence: z.enum(LEVELS),
	interest: z.enum(LEVELS),
	expects: z.string(),
	techLevel: z.enum(TECH_LEVELS).nullable(),
	interactions: z.string(),
	informEvery: z.enum(INFORM_EVERY).nullable(),
	userId: id.nullable(),
	position
};

// Updates send only what changes: `.partial()` with no defaults, so nothing else is reset.
const update = <S extends z.ZodRawShape>(shape: S) =>
	z
		.object({ id, ...shape })
		.partial()
		.required({ id: true } as never) as unknown as z.ZodObject<
		{ id: typeof id } & { [K in keyof S]: z.ZodOptional<S[K]> }
	>;

const byId = z.object({ id });

export const framingCommands = (framing: Framing) => ({
	'framing.createInitiative': command(
		z
			.object({ id, projectId: id, ...initiative })
			.partial({ why: true, metricId: true, position: true }),
		({ userId }, input) => framing.createInitiative(input, userId)
	),
	'framing.updateInitiative': command(update(initiative), ({ userId }, { id, ...patch }) =>
		framing.updateInitiative(id, patch, userId)
	),
	'framing.deleteInitiative': command(byId, ({ userId }, input) =>
		framing.deleteInitiative(input.id, userId)
	),
	'framing.createEpic': command(
		z.object({ id, projectId: id, ...epic }).partial({
			description: true,
			initiativeId: true,
			componentId: true,
			later: true,
			position: true
		}),
		({ userId }, input) => framing.createEpic(input, userId)
	),
	'framing.updateEpic': command(
		update({ ...epic, why: z.string().max(500) }),
		({ userId }, { id, ...patch }) => framing.updateEpic(id, patch, userId)
	),
	'framing.deleteEpic': command(byId, ({ userId }, input) => framing.deleteEpic(input.id, userId)),
	'framing.createStory': command(
		z.object({ id, projectId: id, ...story }).partial({
			epicId: true,
			personaId: true,
			soThat: true,
			criteria: true,
			position: true
		}),
		({ userId }, input) => framing.createStory(input, userId)
	),
	'framing.updateStory': command(update(story), ({ userId }, { id, ...patch }) =>
		framing.updateStory(id, patch, userId)
	),
	'framing.deleteStory': command(byId, ({ userId }, input) =>
		framing.deleteStory(input.id, userId)
	),
	'framing.storyFromTask': command(
		z.object({ id, taskId: id, epicId: id.nullable().optional() }),
		({ userId }, input) => framing.storyFromTask(input, userId)
	),
	'framing.createStakeholder': command(
		z.object({ id, projectId: id, ...stakeholder }).partial({
			organization: true,
			role: true,
			influence: true,
			interest: true,
			expects: true,
			techLevel: true,
			interactions: true,
			informEvery: true,
			userId: true,
			position: true
		}),
		({ userId }, input) => framing.createStakeholder(input, userId)
	),
	'framing.updateStakeholder': command(update(stakeholder), ({ userId }, { id, ...patch }) =>
		framing.updateStakeholder(id, patch, userId)
	),
	'framing.deleteStakeholder': command(byId, ({ userId }, input) =>
		framing.deleteStakeholder(input.id, userId)
	),
	'framing.createJourney': command(
		z.object({ id, projectId: id, title: z.string(), body: z.string().optional() }),
		({ userId }, input) => framing.createJourney(input, userId)
	),
	'framing.updateJourney': command(
		update({ title: z.string(), body: z.string(), position }),
		({ userId }, { id, ...patch }) => framing.updateJourney(id, patch, userId)
	),
	'framing.deleteJourney': command(byId, ({ userId }, input) =>
		framing.deleteJourney(input.id, userId)
	),
	'framing.createTerm': command(
		z.object({ id, projectId: id, term: z.string(), definition: z.string().optional() }),
		({ userId }, input) => framing.createTerm(input, userId)
	),
	'framing.updateTerm': command(
		update({ term: z.string(), definition: z.string() }),
		({ userId }, { id, ...patch }) => framing.updateTerm(id, patch, userId)
	),
	'framing.deleteTerm': command(byId, ({ userId }, input) => framing.deleteTerm(input.id, userId)),
	'framing.createSwotItem': command(
		z.object({ id, projectId: id, quadrant: z.enum(SWOT_QUADRANTS), text: z.string() }),
		({ userId }, input) => framing.createSwotItem(input, userId)
	),
	'framing.updateSwotItem': command(
		update({ text: z.string(), position }),
		({ userId }, { id, ...patch }) => framing.updateSwotItem(id, patch, userId)
	),
	'framing.deleteSwotItem': command(byId, ({ userId }, input) =>
		framing.deleteSwotItem(input.id, userId)
	),
	'framing.createStrategy': command(
		z.object({
			id,
			projectId: id,
			kind: z.enum(STRATEGY_KINDS),
			text: z.string(),
			itemIds: z.array(id).max(10).optional()
		}),
		({ userId }, input) => framing.createStrategy(input, userId)
	),
	'framing.updateStrategy': command(
		update({ text: z.string(), itemIds: z.array(id).max(10) }),
		({ userId }, { id, ...patch }) => framing.updateStrategy(id, patch, userId)
	),
	'framing.deleteStrategy': command(byId, ({ userId }, input) =>
		framing.deleteStrategy(input.id, userId)
	),
	'framing.strategyToEpic': command(byId, ({ userId }, input) =>
		framing.strategyToEpic(input.id, userId)
	),
	'framing.strategyToHypothesis': command(byId, ({ userId }, input) =>
		framing.strategyToHypothesis(input.id, userId)
	)
});
