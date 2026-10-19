import { beforeEach, describe, expect, it } from 'vitest';
import {
	FakeAccess,
	FixedClock,
	MemoryTable,
	RecordingActivity,
	RecordingFeed,
	testId
} from '../../kernel/testing';
import { notFound } from '../../kernel/domain/errors';
import { newTask, type Task } from '../../tasks/domain/task';
import type { Decision } from '../domain/decision';
import type { Hypothesis } from '../domain/hypothesis';
import type { Metric, MetricReading } from '../domain/metric';
import type { Release } from '../domain/release';
import type { Milestone } from '../domain/milestone';
import { createRoadmap } from '../index';
import type { Store } from './ports';

function store<T extends { id: string; projectId: string }>(table = new MemoryTable<T>()) {
	const s: Store<T> = {
		ofProjects: async (ids) => table.all().filter((r) => ids.includes(r.projectId)),
		ofProject: async (id) => table.all().filter((r) => r.projectId === id),
		get: async (id) => table.get(id),
		put: async (item) => table.put(item),
		delete: async (id) => table.delete(id)
	};
	return { table, store: s };
}

function setup() {
	const clock = new FixedClock();
	const milestones = store<Milestone>();
	const decisions = store<Decision>();
	const releases = store<Release>();
	const tasks = new MemoryTable<Task>();
	const channels: string[] = [];
	const activity = new RecordingActivity();
	let number = 0;
	const roadmap = createRoadmap({
		milestones: milestones.store,
		decisions: decisions.store,
		hypotheses: store<Hypothesis>().store,
		metrics: store<Metric>().store,
		readings: store<MetricReading>().store,
		releases: releases.store,
		tasks: {
			ofMilestone: async (id) => tasks.all().filter((t) => t.milestoneId === id),
			ofRelease: async (id) => tasks.all().filter((t) => t.releaseId === id),
			componentNames: async () => new Map([['c-rdv', 'RDV']]),
			async get(id) {
				const task = tasks.get(id);
				if (!task) throw notFound('Tâche');
				return task;
			},
			async create(input, actorId) {
				const task = newTask(
					{ ...input, number: ++number, position: number },
					actorId,
					clock.now()
				);
				tasks.put(task);
				return task;
			},
			async move(id, patch) {
				const task = { ...tasks.get(id)!, ...patch };
				tasks.put(task);
				return task;
			}
		},
		channels: { ensure: async (_, name) => void channels.push(name) },
		messages: { projectOf: async (id) => (id === 'msg-p1' ? 'p1' : 'p2') },
		access: new FakeAccess({ p1: ['ana', 'hugo'], p2: ['paul'] }),
		clock,
		milestoneFeed: new RecordingFeed<Milestone>(),
		decisionFeed: new RecordingFeed<Decision>(),
		hypothesisFeed: new RecordingFeed<Hypothesis>(),
		metricFeed: new RecordingFeed<Metric>(),
		readingFeed: new RecordingFeed<MetricReading>(),
		releaseFeed: new RecordingFeed<Release>(),
		activity,
		newId: testId
	});
	return { roadmap, milestones, decisions, releases, tasks, channels, activity };
}

describe('roadmap', () => {
	let ctx: ReturnType<typeof setup>;
	beforeEach(() => (ctx = setup()));
	const step = (title: string, targetDate: string | null = null) =>
		ctx.roadmap.createMilestone({ id: testId(), projectId: 'p1', title, targetDate }, 'ana');
	const task = (milestoneId: string, title: string, status: Task['status'] = 'todo') => {
		const t = newTask(
			{ id: testId(), projectId: 'p1', number: 1, title, status, milestoneId, position: 0 },
			'ana',
			new Date()
		);
		ctx.tasks.put(t);
		return t;
	};
	const decisionTexts = () => ctx.decisions.table.all().map((d) => d.text);

	it('keeps steps private to the team', async () => {
		await expect(
			ctx.roadmap.createMilestone({ id: testId(), projectId: 'p1', title: 'X' }, 'paul')
		).rejects.toThrow(/ne fais pas partie/);
	});

	it('writes a decision when a date moves, never when it is first set', async () => {
		const core = await step('Le cœur');
		await ctx.roadmap.updateMilestone(core.id, { targetDate: '2027-01-29' }, '', 'ana');
		expect(decisionTexts()).toEqual([]);
		await ctx.roadmap.updateMilestone(core.id, { targetDate: '2027-02-05' }, 'Google', 'ana');
		const [decision] = ctx.decisions.table.all();
		await expect(ctx.roadmap.deleteDecision(decision.id, 'ana')).rejects.toThrow(/trace/);
		expect(decision).toMatchObject({
			source: 'date',
			text: '« Le cœur » : 29/01 → 05/02',
			why: 'Google',
			milestoneId: core.id
		});
	});

	it('closes a step with only finished work left, carrying the rest to the next one', async () => {
		const proof = await step('Preuve', '2026-11-13');
		const design = await step('Conception', '2026-12-04');
		task(proof.id, 'Fait', 'done');
		const open = task(proof.id, 'Pas fini', 'doing');
		const idea = task(proof.id, 'Une piste', 'idea');
		await ctx.roadmap.closeMilestone(proof.id, 'next', 'ana');
		expect(ctx.tasks.get(open.id)).toMatchObject({ milestoneId: design.id, status: 'doing' });
		expect(ctx.tasks.get(idea.id)!.milestoneId).toBe(design.id);
		expect(decisionTexts()).toEqual([
			'Sorti de « Preuve » : 1 tâche reportée à « Conception » (Pas fini)'
		]);
		expect(ctx.activity.verbs).toContain('milestone.closed');
		await expect(ctx.roadmap.closeMilestone(proof.id, 'next', 'ana')).rejects.toThrow(/déjà/);
	});

	it('puts unfinished work back in the ideas, without a step, when asked', async () => {
		const last = await step('Mise en ligne');
		const open = task(last.id, 'Analytics');
		await ctx.roadmap.closeMilestone(last.id, 'ideas', 'ana');
		expect(ctx.tasks.get(open.id)).toMatchObject({ milestoneId: null, status: 'idea' });
	});

	it('closes without a decision when everything is done', async () => {
		const proof = await step('Preuve');
		task(proof.id, 'Fait', 'done');
		await ctx.roadmap.closeMilestone(proof.id, 'next', 'ana');
		expect(decisionTexts()).toEqual([]);
	});

	it('detaches the tasks of a deleted step, and says so when it held work or a date', async () => {
		const proof = await step('Preuve');
		const t = task(proof.id, 'Garde-moi');
		await ctx.roadmap.deleteMilestone(proof.id, 'ana');
		expect(ctx.tasks.get(t.id)!.milestoneId).toBeNull();
		expect(decisionTexts()).toEqual(['Étape « Preuve » supprimée ; 1 tâche ouverte sans étape']);
		await ctx.roadmap.deleteMilestone((await step('Vide')).id, 'ana');
		expect(decisionTexts()).toHaveLength(1);
	});

	it('keeps the order set by hand, a dated step landing before the steps due later', async () => {
		const a = await step('A', '2026-11-06');
		const c = await step('C', '2026-12-04');
		const b = await step('B', '2026-11-20');
		const order = () =>
			ctx.milestones.table
				.all()
				.sort((x, y) => x.position - y.position)
				.map((m) => m.title);
		expect(order()).toEqual(['A', 'B', 'C']);
		await ctx.roadmap.reorderMilestone(a.id, c.position + 1, 'ana');
		expect(order()).toEqual(['B', 'C', 'A']);
		expect(b.id).toBeTruthy();
	});

	it('lays out a template once, with its tasks and channels', async () => {
		const steps = await ctx.roadmap.applyTemplate(
			{ projectId: 'p1', template: 'product', today: '2026-11-02', deadline: '2027-02-26' },
			'ana'
		);
		expect(steps).toHaveLength(7);
		expect(ctx.tasks.all().every((t) => steps.some((s) => s.id === t.milestoneId))).toBe(true);
		expect(ctx.tasks.all().find((t) => t.title === 'Mise en production')!.checklist).toHaveLength(
			6
		);
		expect(ctx.channels).toEqual(['retours']);
		await expect(
			ctx.roadmap.applyTemplate(
				{ projectId: 'p1', template: 'express', today: '2026-11-02', deadline: null },
				'ana'
			)
		).rejects.toThrow(/déjà des étapes/);
	});

	it('links a decision only to things of its project', async () => {
		const base = { id: testId(), projectId: 'p1', text: 'Pas de SMS en V1' };
		expect(
			await ctx.roadmap.createDecision({ ...base, messageId: 'msg-p1' }, 'hugo')
		).toMatchObject({ messageId: 'msg-p1', decidedBy: 'hugo' });
		await expect(
			ctx.roadmap.createDecision({ ...base, id: testId(), messageId: 'msg-p2' }, 'hugo')
		).rejects.toThrow(/projet/);
	});

	it('lets only its author take a decision back', async () => {
		const d = await ctx.roadmap.createDecision(
			{ id: testId(), projectId: 'p1', text: '29 €' },
			'ana'
		);
		await expect(ctx.roadmap.deleteDecision(d.id, 'hugo')).rejects.toThrow(/Remplace/);
		await ctx.roadmap.deleteDecision(d.id, 'ana');
		expect(decisionTexts()).toEqual([]);
	});

	it('checks a hypothesis with a task of the step under way, and settles it as a decision', async () => {
		const proof = await step('Preuve');
		const h = await ctx.roadmap.createHypothesis(
			{ id: testId(), projectId: 'p1', text: 'Les kinés paieront 29 €' },
			'ana'
		);
		const verified = await ctx.roadmap.verifyHypothesis(h.id, 'ana');
		expect(ctx.tasks.get(verified.taskId!)).toMatchObject({
			title: 'Vérifier : Les kinés paieront 29 €',
			milestoneId: proof.id
		});
		await expect(ctx.roadmap.judgeHypothesis(h.id, 'true', '', 'hugo')).rejects.toThrow(
			/Termine d’abord/
		);
		ctx.tasks.put({ ...ctx.tasks.get(verified.taskId!)!, status: 'done' });
		await ctx.roadmap.judgeHypothesis(h.id, 'true', '7 sur 12', 'hugo');
		expect(ctx.decisions.table.all()[0]).toMatchObject({
			source: 'verdict',
			text: 'Hypothèse confirmée : Les kinés paieront 29 €',
			hypothesisId: h.id,
			taskId: verified.taskId
		});
		await expect(ctx.roadmap.judgeHypothesis(h.id, 'false', '', 'ana')).rejects.toThrow(/tranchée/);
	});

	it('keeps at most three hypotheses open', async () => {
		for (const text of ['A', 'B', 'C'])
			await ctx.roadmap.createHypothesis({ id: testId(), projectId: 'p1', text }, 'ana');
		await expect(
			ctx.roadmap.createHypothesis({ id: testId(), projectId: 'p1', text: 'D' }, 'ana')
		).rejects.toThrow(/3 hypothèses/);
	});

	it('keeps one reading per week and per number, on its Monday', async () => {
		const metric = await ctx.roadmap.createMetric(
			{ id: testId(), projectId: 'p1', name: 'Clients payants', target: 50 },
			'ana'
		);
		const first = await ctx.roadmap.recordReading(
			{ metricId: metric.id, day: '2026-10-21', value: 3 },
			'ana'
		);
		const again = await ctx.roadmap.recordReading(
			{ metricId: metric.id, day: '2026-10-23', value: 4 },
			'hugo'
		);
		expect(first.weekOf).toBe('2026-10-19');
		expect(again.id).toBe(first.id);
		await expect(
			ctx.roadmap.recordReading({ metricId: metric.id, day: '2026-10-23', value: 1 }, 'paul')
		).rejects.toThrow(/ne fais pas partie/);
	});

	it('follows five numbers at most', async () => {
		for (const name of ['A', 'B', 'C', 'D', 'E'])
			await ctx.roadmap.createMetric({ id: testId(), projectId: 'p1', name }, 'ana');
		await expect(
			ctx.roadmap.createMetric({ id: testId(), projectId: 'p1', name: 'F' }, 'ana')
		).rejects.toThrow(/5 chiffres/);
	});

	it('ships only finished work of the project, once, with its changelog', async () => {
		const fix = task('', 'Horaires du samedi', 'done');
		ctx.tasks.put({ ...fix, kind: 'bug', reportedBy: 'Pharmacie Martin', componentId: 'c-rdv' });
		const open = task('', 'Pas fini', 'doing');
		const ship = (taskIds: string[]) =>
			ctx.roadmap.shipRelease({ id: testId(), projectId: 'p1', name: 'v1.1', taskIds }, 'ana');
		await expect(ship([open.id])).rejects.toThrow(/pas prête/);
		const release = await ship([fix.id]);
		expect(release.changelog).toContain('## Corrections');
		expect(release.changelog).toContain(
			'RDV : Horaires du samedi (#1, signalé par Pharmacie Martin)'
		);
		expect(ctx.tasks.get(fix.id)!.releaseId).toBe(release.id);
		await expect(ship([fix.id])).rejects.toThrow(/déjà en prod/);
		await ctx.roadmap.deleteRelease(release.id, 'ana');
		expect(ctx.tasks.get(fix.id)!.releaseId).toBeNull();
	});
});
