import { describe, expect, it } from 'vitest';
import type { Project } from '$lib/modules/projects/domain/project';
import type { Decision } from '$lib/modules/roadmap/domain/decision';
import type { Milestone } from '$lib/modules/roadmap/domain/milestone';
import { newTask, type Task } from '$lib/modules/tasks/domain/task';
import { milestoneReview } from './milestone-review';
import { dueByDelivery, weekReport } from './report';
import { inScope, stepForecasts, stepForScope, waitsForLaterStep } from './roadmap';
import { agendaOf } from './sync-point';

const now = new Date(2026, 9, 19, 10);
const today = '2026-10-19';
const DAY = 86_400_000;

const step = (id: string, extra: Partial<Milestone> = {}): Milestone => ({
	id,
	projectId: 'p',
	title: id,
	doneWhen: '',
	targetDate: null,
	position: 0,
	closedAt: null,
	closedBy: null,
	createdBy: 'ana',
	createdAt: '2026-09-01T10:00:00.000Z',
	...extra
});

let n = 0;
const task = (patch: Partial<Task>): Task => ({
	...newTask({ id: `t${++n}`, projectId: 'p', number: n, title: `T${n}`, position: n }, 'ana', now),
	...patch
});
/** Finished `days` ago: what sets the pace. */
const doneAgo = (days: number, patch: Partial<Task> = {}) =>
	task({
		status: 'done',
		completedAt: new Date(now.getTime() - days * DAY).toISOString(),
		...patch
	});

// Seven tasks finished in four weeks: a pace of 1.75 a week, a quarter of a task a day.
const pace = Array.from({ length: 7 }, (_, i) => doneAgo(i * 3 + 1));

describe('step forecasts', () => {
	const steps = [
		step('proof', { targetDate: '2026-10-10', closedAt: '2026-10-09T10:00:00.000Z' }),
		step('design', { targetDate: '2026-10-30' }),
		step('core', { targetDate: '2026-11-06' }),
		step('life')
	];

	it('adds up the work of each step after the previous ones, at the real pace', () => {
		const tasks = [
			...pace,
			task({ milestoneId: 'design' }),
			task({ milestoneId: 'design', status: 'doing' }),
			task({ milestoneId: 'core' }),
			task({ milestoneId: 'core' }),
			task({ milestoneId: 'core', status: 'idea' }),
			task({})
		];
		const forecasts = stepForecasts(steps, tasks, today, now);
		expect(forecasts.get('proof')?.state).toBe('closed');
		// Design: its 2 tasks plus the one without a step, 3 tasks at 0.25 a day = 12 days.
		expect(forecasts.get('design')).toMatchObject({
			predicted: '2026-10-31',
			state: 'late',
			lateDays: 1
		});
		// Core waits for design too; the idea counts for nothing.
		expect(forecasts.get('core')).toMatchObject({
			total: 2,
			predicted: '2026-11-08',
			state: 'late'
		});
		expect(forecasts.get('life')?.state).toBe('undated');
	});

	it('says nothing about dates without enough finished work', () => {
		const forecasts = stepForecasts(steps, [task({ milestoneId: 'design' })], today, now);
		expect(forecasts.get('design')).toMatchObject({ state: 'unknown', predicted: null });
	});

	it('is ready to close once everything counted is done', () => {
		const tasks = [
			doneAgo(1, { milestoneId: 'design' }),
			task({ milestoneId: 'design', status: 'idea' })
		];
		expect(stepForecasts(steps, tasks, today, now).get('design')?.ready).toBe(true);
	});
});

describe('step scope', () => {
	const later = task({ milestoneId: 'core' });
	const laterDoing = task({ milestoneId: 'core', status: 'doing' });
	const loose = task({});

	it('keeps the steps to come out of the way, but never hides work under way', () => {
		expect(waitsForLaterStep(later, 'design')).toBe(true);
		expect(inScope(later, 'current', 'design')).toBe(false);
		expect(inScope(laterDoing, 'current', 'design')).toBe(true);
		expect(inScope(loose, 'current', 'design')).toBe(true);
		expect(inScope(loose, 'core', 'design')).toBe(false);
		expect(inScope(later, 'all', 'design')).toBe(true);
	});

	it('places a new task in the step shown', () => {
		expect(stepForScope('current', 'design')).toBe('design');
		expect(stepForScope('all', 'design')).toBeNull();
		expect(stepForScope('core', 'design')).toBe('core');
		// An idea noted from the step under way goes to the general pool.
		expect(stepForScope('current', 'design', 'idea')).toBeNull();
		expect(stepForScope('core', 'design', 'idea')).toBe('core');
	});
});

describe('step review', () => {
	it('tells planned against actual, work added on the way and decisions', () => {
		const proof = step('Preuve', {
			targetDate: '2026-10-16',
			closedAt: '2026-10-19T10:00:00.000Z',
			createdAt: '2026-10-01T10:00:00.000Z'
		});
		const design = step('Conception', { targetDate: '2026-11-06' });
		const decision = (text: string, decidedAt: string): Decision => ({
			id: text,
			projectId: 'p',
			text,
			why: '',
			messageId: null,
			taskId: null,
			milestoneId: null,
			hypothesisId: null,
			supersedes: null,
			source: 'manual',
			decidedBy: 'ana',
			decidedAt
		});
		const text = milestoneReview({
			milestone: proof,
			milestones: [proof, design],
			tasks: [
				doneAgo(2, { milestoneId: 'Preuve', createdAt: '2026-10-01T10:00:10.000Z' }),
				doneAgo(1, { milestoneId: 'Preuve', createdAt: '2026-10-10T10:00:00.000Z' })
			],
			decisions: [
				decision('Prix : 29 €', '2026-10-12T10:00:00.000Z'),
				decision('Avant', '2026-09-12T10:00:00.000Z')
			],
			note: 'Appeler plus tôt',
			carried: { titles: ['Relances'], to: 'Conception' },
			next: design,
			nextForecast: undefined
		});
		expect(text).toContain('« Preuve » close le 19/10, prévue le 16/10 : 3 jours de retard');
		expect(text).toContain('2 tâches terminées, dont 1 ajoutée en route');
		expect(text).toContain('1 tâche reportée à « Conception » (Relances)');
		expect(text).toContain('- Prix : 29 €');
		expect(text).not.toContain('Avant');
		expect(text).toContain('À changer pour la suite : Appeler plus tôt');
		expect(text).toContain('Prochaine étape : « Conception », prévue le 06/11');
	});
});

describe('the roadmap elsewhere', () => {
	it('opens the point on a late step and the missing number', () => {
		const items = agendaOf({
			tasks: [task({ milestoneId: 'core' })],
			questions: [],
			risks: new Map(),
			now,
			step: { id: 'design', late: true, ready: false },
			metricMissing: true
		});
		// The unsorted task belongs to a step to come: not one to sort now.
		expect(items.map((i) => i.kind)).toEqual(['step-late', 'metric']);
	});

	it('does not count steps planned after the delivery against it', () => {
		const project = { id: 'p', deadline: '2026-11-30' } as Project;
		const counts = dueByDelivery(project, [
			step('core', { targetDate: '2026-11-20' }),
			step('launch', { targetDate: '2026-12-20' }),
			step('life')
		]);
		expect(counts(task({ milestoneId: 'core' }))).toBe(true);
		expect(counts(task({}))).toBe(true);
		expect(counts(task({ milestoneId: 'launch' }))).toBe(false);
		expect(counts(task({ milestoneId: 'life' }))).toBe(false);
	});

	it('reports the step under way, the decisions and the number', () => {
		const project = { id: 'p', name: 'Kinéo', deadline: null } as Project;
		const text = weekReport(project, pace, () => null, today, now, {
			milestones: [
				step('Conception', { targetDate: '2026-11-06' }),
				step('Bêta', { targetDate: '2026-11-27' })
			],
			decisions: [
				{
					id: 'd',
					projectId: 'p',
					text: 'Pas de SMS en V1',
					why: '',
					messageId: null,
					taskId: null,
					milestoneId: null,
					hypothesisId: null,
					supersedes: null,
					source: 'manual',
					decidedBy: 'ana',
					decidedAt: new Date(now.getTime() - DAY).toISOString()
				}
			],
			metrics: [
				{
					id: 'm',
					projectId: 'p',
					name: 'Clients payants',
					unit: '',
					target: 50,
					direction: 'up',
					position: 1,
					archivedAt: null,
					createdAt: ''
				}
			],
			readings: [
				{
					id: 'a',
					metricId: 'm',
					projectId: 'p',
					weekOf: '2026-10-12',
					value: 36,
					by: 'ana',
					at: ''
				},
				{
					id: 'b',
					metricId: 'm',
					projectId: 'p',
					weekOf: '2026-10-19',
					value: 42,
					by: 'ana',
					at: ''
				}
			]
		});
		expect(text).toContain('Étape en cours (1/2) : Conception, 0/0 tâches, prévue le 06/11');
		expect(text).toContain('Prochaine étape : Bêta, prévue le 27/11.');
		expect(text).toContain('Décidé cette semaine (1)\n- Pas de SMS en V1');
		expect(text).toContain('Clients payants : 42 / 50 (+6 sur la semaine)');
	});
});
