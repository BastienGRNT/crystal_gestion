import { describe, expect, it } from 'vitest';
import type { Metric, MetricReading } from '$lib/modules/roadmap/domain/metric';
import { newTask, type Task } from '$lib/modules/tasks/domain/task';
import { metricViews, missingThisWeek, teamRhythm } from './metrics';

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
