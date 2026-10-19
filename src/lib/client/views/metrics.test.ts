import { describe, expect, it } from 'vitest';
import type { Metric, MetricReading } from '$lib/modules/roadmap/domain/metric';
import { newTask, type Task } from '$lib/modules/tasks/domain/task';
import { daysSpent, goalOf, metricViews, missingThisWeek, teamRhythm, timeByKind } from './metrics';

const now = new Date(2026, 9, 21, 12);
const today = '2026-10-21';
const DAY = 86_400_000;
const ago = (days: number) => new Date(now.getTime() - days * DAY).toISOString();

const metric = (id: string, extra: Partial<Metric> = {}): Metric => ({
	id,
	projectId: 'p',
	name: id,
	unit: '',
	target: null,
	direction: 'up',
	position: 1,
	archivedAt: null,
	createdAt: '',
	...extra
});
const reading = (metricId: string, weekOf: string, value: number): MetricReading => ({
	id: `${metricId}:${weekOf}`,
	metricId,
	projectId: 'p',
	weekOf,
	value,
	by: 'ana',
	at: ''
});

let n = 0;
const task = (patch: Partial<Task>): Task => ({
	...newTask({ id: `t${++n}`, projectId: 'p', number: n, title: `T${n}`, position: n }, 'ana', now),
	...patch
});

describe('project numbers', () => {
	it('tells the trend in the right direction and what is missing this week', () => {
		const metrics = [metric('clients'), metric('churn', { direction: 'down' }), metric('new')];
		const readings = [
			reading('clients', '2026-10-12', 36),
			reading('clients', '2026-10-19', 42),
			reading('churn', '2026-10-05', 4),
			reading('churn', '2026-10-12', 5)
		];
		const [clients, churn] = metricViews(metrics, readings, today);
		expect(clients).toMatchObject({ last: 42, delta: 6, good: true, thisWeek: 42 });
		expect(churn).toMatchObject({ delta: 1, good: false, thisWeek: null });
		// Only numbers already followed are asked for.
		expect(missingThisWeek(metrics, readings, today).map((m) => m.id)).toEqual(['churn']);
	});

	it('measures the way to the target, up or down', () => {
		expect(goalOf({ target: 50, direction: 'up' }, 42)).toEqual({
			reached: false,
			gap: 8,
			progress: 0.84
		});
		expect(goalOf({ target: 50, direction: 'up' }, 60)).toMatchObject({
			reached: true,
			progress: 1
		});
		expect(goalOf({ target: 3, direction: 'down' }, 5)).toEqual({
			reached: false,
			gap: 2,
			progress: null
		});
		expect(goalOf({ target: null, direction: 'up' }, 5)).toBeNull();
		expect(goalOf({ target: 50, direction: 'up' }, null)).toBeNull();
	});
});

describe('team rhythm', () => {
	it('counts finished work by kind, cycle times, open bugs and reviews waiting', () => {
		const tasks = [
			...[3, 5, 9].map((d) => task({ status: 'done', startedAt: ago(d + 2), completedAt: ago(d) })),
			task({
				kind: 'bug',
				status: 'done',
				critical: true,
				createdAt: ago(1.25),
				completedAt: ago(1)
			}),
			task({ kind: 'bug', status: 'todo', createdAt: ago(10) }),
			task({ kind: 'bug', status: 'doing', critical: true, createdAt: ago(1) }),
			task({ status: 'review', statusChangedAt: ago(2) })
		];
		const rhythm = teamRhythm(tasks, now);
		expect(rhythm.perWeek).toBe(1);
		expect(rhythm.cycleDays.feature).toBe(2);
		expect(rhythm.cycleDays.bug).toBeNull();
		expect(rhythm).toMatchObject({
			openBugs: 2,
			criticalBugs: 1,
			oldestBugDays: 10,
			waitingReview: 1
		});
		expect(rhythm.criticalFixHours).toBe(6);
		expect(rhythm.share.feature).toBe(0.75);
		// Wednesday: this week holds the bug fixed yesterday, last week the three features.
		expect(rhythm.weeks.at(-1)!.byKind).toMatchObject({ feature: 0, bug: 1 });
		expect(rhythm.weeks.at(-2)!.byKind).toMatchObject({ feature: 3 });
	});
});

describe('time spent', () => {
	const block = (taskId: string | null, fromHoursAgo: number, toHoursAgo: number) => ({
		projectId: 'p',
		taskId,
		startsAt: new Date(now.getTime() - fromHoursAgo * 3_600_000).toISOString(),
		endsAt: new Date(now.getTime() - toHoursAgo * 3_600_000).toISOString()
	});

	it('counts the past part of the blocks, by kind of task', () => {
		const bug = task({ kind: 'bug' });
		const feature = task({});
		const blocks = [
			block(bug.id, 3, 1),
			block(feature.id, 5, 1),
			block(null, 2, 0),
			block(feature.id, 1, -2)
		];
		const time = timeByKind(blocks, [bug, feature], now)!;
		expect(time.hours).toMatchObject({ bug: 2, feature: 5 });
		expect(time.untasked).toBe(2);
		expect(time.total).toBe(9);
		expect(timeByKind([], [], now)).toBeNull();
	});

	it('turns the hours of a project into days', () => {
		expect(
			daysSpent([block(null, 15, 1), { ...block(null, 9, 2), projectId: 'other' }], 'p', now)
		).toBe(2);
	});
});
