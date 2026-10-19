import { z } from 'zod';
import { command, dateKey, id } from '$lib/server/commands/define';
import { DIRECTIONS } from '../domain/metric';
import { TEMPLATE_KEYS } from '../domain/templates';
import type { Roadmap } from '../index';

export const roadmapCommands = (roadmap: Roadmap) => ({
	'roadmap.createMilestone': command(
		z.object({
			id,
			projectId: id,
			title: z.string(),
			doneWhen: z.string().optional(),
			targetDate: dateKey.nullable().optional()
		}),
		({ userId }, input) => roadmap.createMilestone(input, userId)
	),
	// No defaults: an update only touches the fields it sends.
	'roadmap.updateMilestone': command(
		z.object({
			id,
			title: z.string().optional(),
			doneWhen: z.string().optional(),
			targetDate: dateKey.nullable().optional(),
			/** Why the date moves, kept with the decision written for it. */
			reason: z.string().optional()
		}),
		({ userId }, { id, reason, ...patch }) =>
			roadmap.updateMilestone(id, patch, reason ?? '', userId)
	),
	'roadmap.reorderMilestone': command(
		z.object({ id, position: z.number().finite() }),
		({ userId }, input) => roadmap.reorderMilestone(input.id, input.position, userId)
	),
	'roadmap.deleteMilestone': command(z.object({ id }), ({ userId }, input) =>
		roadmap.deleteMilestone(input.id, userId)
	),
	'roadmap.closeMilestone': command(
		z.object({ id, carry: z.enum(['next', 'ideas']) }),
		({ userId }, input) => roadmap.closeMilestone(input.id, input.carry, userId)
	),
	'roadmap.applyTemplate': command(
		z.object({
			projectId: id,
			template: z.enum(TEMPLATE_KEYS),
			today: dateKey,
			deadline: dateKey.nullable()
		}),
		({ userId }, input) => roadmap.applyTemplate(input, userId)
	),
	'roadmap.createDecision': command(
		z.object({
			id,
			projectId: id,
			text: z.string(),
			why: z.string().optional(),
			messageId: id.nullable().optional(),
			taskId: id.nullable().optional(),
			milestoneId: id.nullable().optional(),
			hypothesisId: id.nullable().optional(),
			supersedes: id.nullable().optional()
		}),
		({ userId }, input) => roadmap.createDecision(input, userId)
	),
	'roadmap.deleteDecision': command(z.object({ id }), ({ userId }, input) =>
		roadmap.deleteDecision(input.id, userId)
	),
	'roadmap.createHypothesis': command(
		z.object({ id, projectId: id, text: z.string() }),
		({ userId }, input) => roadmap.createHypothesis(input, userId)
	),
	'roadmap.updateHypothesis': command(z.object({ id, text: z.string() }), ({ userId }, input) =>
		roadmap.updateHypothesis(input.id, input.text, userId)
	),
	'roadmap.deleteHypothesis': command(z.object({ id }), ({ userId }, input) =>
		roadmap.deleteHypothesis(input.id, userId)
	),
	'roadmap.verifyHypothesis': command(z.object({ id }), ({ userId }, input) =>
		roadmap.verifyHypothesis(input.id, userId)
	),
	'roadmap.judgeHypothesis': command(
		z.object({ id, verdict: z.enum(['true', 'false']), why: z.string().optional() }),
		({ userId }, input) => roadmap.judgeHypothesis(input.id, input.verdict, input.why ?? '', userId)
	),
	'roadmap.createMetric': command(
		z.object({
			id,
			projectId: id,
			name: z.string(),
			unit: z.string().optional(),
			target: z.number().finite().nullable().optional(),
			direction: z.enum(DIRECTIONS).optional()
		}),
		({ userId }, input) => roadmap.createMetric(input, userId)
	),
	'roadmap.updateMetric': command(
		z
			.object({
				id,
				name: z.string(),
				unit: z.string(),
				target: z.number().finite().nullable(),
				direction: z.enum(DIRECTIONS),
				position: z.number().finite(),
				archived: z.boolean()
			})
			.partial()
			.required({ id: true }),
		({ userId }, { id, ...patch }) => roadmap.updateMetric(id, patch, userId)
	),
	'roadmap.recordReading': command(
		z.object({ metricId: id, day: dateKey, value: z.number().finite() }),
		({ userId }, input) => roadmap.recordReading(input, userId)
	),
	'roadmap.shipRelease': command(
		z.object({
			id,
			projectId: id,
			name: z.string(),
			taskIds: z.array(id).max(500),
			notes: z.string().max(20_000).optional()
		}),
		({ userId }, input) => roadmap.shipRelease(input, userId)
	),
	'roadmap.updateRelease': command(
		z.object({ id, name: z.string().optional(), notes: z.string().max(20_000).optional() }),
		({ userId }, { id, ...patch }) => roadmap.updateRelease(id, patch, userId)
	),
	'roadmap.deleteRelease': command(z.object({ id }), ({ userId }, input) =>
		roadmap.deleteRelease(input.id, userId)
	)
});
