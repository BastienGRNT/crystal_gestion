import { conflict, invalid, notFound } from '../../kernel/domain/errors';
import type { DateKey } from '../../kernel/domain/dates';
import { isOpen } from '../../tasks/domain/task';
import {
	carriedOver,
	cleanMilestonePatch,
	dateChange,
	nextMilestone,
	removal,
	positionForNew,
	validDoneWhen,
	validMilestoneTitle,
	validTargetDate,
	type Milestone,
	type MilestonePatch
} from '../domain/milestone';
import { planTemplate, TEMPLATES, type TemplateKey } from '../domain/templates';
import { recordDecision } from './decisions';
import type { RoadmapDeps } from './ports';

export interface NewMilestone {
	id: string;
	projectId: string;
	title: string;
	doneWhen?: string;
	targetDate?: DateKey | null;
	componentId?: string | null;
}

/** A step moves a module of its own project forward, or the project's own line. */
async function checkComponent(deps: RoadmapDeps, projectId: string, id: string | null | undefined) {
	if (id && !(await deps.tasks.componentNames(projectId)).has(id)) throw invalid('Module inconnu.');
}

/** What happens to unfinished work when a step closes. */
export type Carry = 'next' | 'ideas';

async function existing(deps: RoadmapDeps, id: string, actorId: string) {
	const milestone = await deps.milestones.get(id);
	if (!milestone) throw notFound('Étape');
	await deps.access.assertMember(milestone.projectId, actorId);
	return milestone;
}

async function save(deps: RoadmapDeps, milestone: Milestone) {
	await deps.milestones.put(milestone);
	deps.milestoneFeed.saved(milestone);
	return milestone;
}

function build(input: NewMilestone, position: number, actorId: string, now: Date): Milestone {
	return {
		id: input.id,
		projectId: input.projectId,
		title: validMilestoneTitle(input.title),
		doneWhen: validDoneWhen(input.doneWhen ?? ''),
		targetDate: validTargetDate(input.targetDate ?? null),
		position,
		componentId: input.componentId ?? null,
		closedAt: null,
		closedBy: null,
		createdBy: actorId,
		createdAt: now.toISOString()
	};
}

export const createMilestone =
	(deps: RoadmapDeps) => async (input: NewMilestone, actorId: string) => {
		await deps.access.assertMember(input.projectId, actorId);
		await checkComponent(deps, input.projectId, input.componentId);
		const position = positionForNew(
			await deps.milestones.ofProject(input.projectId),
			input.targetDate ?? null
		);
		return save(deps, build(input, position, actorId, deps.clock.now()));
	};

/** Moving a date is a decision: it is written down, with the reason when there is one. */
export const updateMilestone =
	(deps: RoadmapDeps) =>
	async (id: string, patch: MilestonePatch, reason: string, actorId: string) => {
		const current = await existing(deps, id, actorId);
		await checkComponent(deps, current.projectId, patch.componentId);
		const milestone = await save(deps, { ...current, ...cleanMilestonePatch(patch) });
		const moved = patch.targetDate !== undefined && milestone.targetDate !== current.targetDate;
		if (moved && current.targetDate)
			await recordDecision(
				deps,
				{
					id: deps.newId(),
					projectId: milestone.projectId,
					text: dateChange(milestone.title, current.targetDate, milestone.targetDate),
					why: reason,
					milestoneId: milestone.id
				},
				actorId,
				'date'
			);
		return milestone;
	};

/** Dragging a step: its new place among the others (fractional, like the board). */
export const reorderMilestone =
	(deps: RoadmapDeps) => async (id: string, position: number, actorId: string) => {
		const milestone = await existing(deps, id, actorId);
		if (!Number.isFinite(position)) throw invalid('Position invalide.');
		return save(deps, { ...milestone, position });
	};

/**
 * Its tasks stay, without a step. A step that was promised for a date, or still held work,
 * leaves a decision behind: dropping it is a change of scope too.
 */
export const deleteMilestone = (deps: RoadmapDeps) => async (id: string, actorId: string) => {
	const milestone = await existing(deps, id, actorId);
	const tasks = await deps.tasks.ofMilestone(id);
	for (const task of tasks) await deps.tasks.move(task.id, { milestoneId: null }, actorId);
	await deps.milestones.delete(id);
	deps.milestoneFeed.removed(milestone);
	const open = tasks.filter(isOpen).length;
	if (milestone.targetDate || open)
		await recordDecision(
			deps,
			{
				id: deps.newId(),
				projectId: milestone.projectId,
				text: removal(milestone.title, milestone.targetDate, open)
			},
			actorId,
			'removal'
		);
};

/**
 * Closing leaves only finished work in the step: the rest goes to the next step, or back to
 * the ideas without a step. Unfinished work leaving is a scope change, so it is a decision.
 */
export const closeMilestone =
	(deps: RoadmapDeps) => async (id: string, carry: Carry, actorId: string) => {
		const milestone = await existing(deps, id, actorId);
		if (milestone.closedAt) throw conflict('Cette étape est déjà close.');
		const next = nextMilestone(await deps.milestones.ofProject(milestone.projectId), id);
		const target = carry === 'next' ? next : null;
		const leaving = (await deps.tasks.ofMilestone(id)).filter((t) => t.status !== 'done');
		for (const task of leaving)
			await deps.tasks.move(
				task.id,
				target ? { milestoneId: target.id } : { milestoneId: null, status: 'idea' },
				actorId
			);
		const unfinished = leaving.filter(isOpen).map((t) => t.title);
		if (unfinished.length)
			await recordDecision(
				deps,
				{
					id: deps.newId(),
					projectId: milestone.projectId,
					text: carriedOver(milestone.title, target?.title ?? null, unfinished),
					milestoneId: milestone.id
				},
				actorId,
				'carry'
			);
		const closed = await save(deps, {
			...milestone,
			closedAt: deps.clock.now().toISOString(),
			closedBy: actorId
		});
		await deps.activity.record({
			actorId,
			verb: 'milestone.closed',
			subject: {
				kind: 'milestone',
				id: closed.id,
				title: closed.title,
				projectId: closed.projectId
			}
		});
		return closed;
	};

/**
 * Lays out a template's steps and their usual tasks. Only on a project without steps: it adds
 * ordinary items and never touches what exists.
 */
export const applyTemplate =
	(deps: RoadmapDeps) =>
	async (
		input: { projectId: string; template: TemplateKey; today: DateKey; deadline: DateKey | null },
		actorId: string
	) => {
		await deps.access.assertMember(input.projectId, actorId);
		if ((await deps.milestones.ofProject(input.projectId)).length)
			throw conflict('Ce projet a déjà des étapes.');
		const now = deps.clock.now();
		const steps = planTemplate(input.template, input.today, validTargetDate(input.deadline));
		const created: Milestone[] = [];
		for (const [i, step] of steps.entries()) {
			const milestone = await save(
				deps,
				build({ id: deps.newId(), projectId: input.projectId, ...step }, i, actorId, now)
			);
			created.push(milestone);
			for (const task of step.tasks)
				await deps.tasks.create(
					{
						id: deps.newId(),
						projectId: input.projectId,
						title: task.title,
						milestoneId: milestone.id,
						checklist: (task.checklist ?? []).map((text) => ({
							id: deps.newId(),
							text,
							done: false
						}))
					},
					actorId
				);
		}
		for (const name of TEMPLATES[input.template].channels)
			await deps.channels.ensure(input.projectId, name, actorId);
		return created;
	};
