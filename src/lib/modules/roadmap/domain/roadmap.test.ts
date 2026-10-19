import { describe, expect, it } from 'vitest';
import { weekdayOf } from '../../kernel/domain/dates';
import {
	carriedOver,
	currentMilestone,
	dateChange,
	nextMilestone,
	orderMilestones,
	positionForNew,
	progressOf,
	startedAt,
	type Milestone
} from './milestone';
import { planTemplate, TEMPLATES } from './templates';

const step = (id: string, extra: Partial<Milestone> = {}): Milestone => ({
	id,
	projectId: 'p1',
	title: id,
	doneWhen: '',
	targetDate: null,
	position: 0,
	closedAt: null,
	closedBy: null,
	createdBy: 'ana',
	createdAt: '2026-10-01T10:00:00Z',
	...extra
});

describe('milestones', () => {
	const steps = [
		step('life', { position: 9 }),
		step('core', { targetDate: '2026-12-04' }),
		step('proof', { targetDate: '2026-11-13', closedAt: '2026-11-12T10:00:00Z' }),
		step('later', { position: 3 })
	];

	it('puts dated steps by date, then undated ones in their order', () => {
		expect(orderMilestones(steps).map((m) => m.id)).toEqual(['proof', 'core', 'later', 'life']);
	});

	it('knows the step under way and the one after', () => {
		expect(currentMilestone(steps)?.id).toBe('core');
		expect(nextMilestone(steps, 'core')?.id).toBe('later');
		expect(nextMilestone(steps, 'life')).toBeNull();
	});

	it('starts a step when the previous one closes', () => {
		expect(startedAt(steps, 'core')).toBe('2026-11-12T10:00:00Z');
		expect(startedAt(steps, 'later')).toBeNull();
		expect(startedAt(steps, 'proof')).toBe('2026-10-01T10:00:00Z');
	});

	it('adds an undated step before the last ones, so "Vie du produit" stays last', () => {
		const position = positionForNew(steps);
		expect(position).toBeLessThan(3);
		const added = orderMilestones([...steps, step('new', { position })]).map((m) => m.id);
		expect(added.at(-1)).toBe('life');
	});

	it('never counts ideas in progress', () => {
		expect(progressOf([{ status: 'done' }, { status: 'todo' }, { status: 'idea' }])).toEqual({
			done: 1,
			total: 2
		});
	});

	it('writes date changes and carried work as decisions', () => {
		expect(dateChange('Le cœur', '2026-01-29', '2026-02-05')).toBe('« Le cœur » : 29/01 → 05/02');
		expect(carriedOver('Preuve', 'Conception', ['A'])).toBe(
			'Sorti de « Preuve » : 1 tâche reportée à « Conception » (A)'
		);
		expect(carriedOver('Preuve', null, ['A', 'B'])).toContain('2 tâches mises en pistes');
	});
});

describe('templates', () => {
	it('dates a product between today and the delivery, on Fridays, the last on the day', () => {
		const plan = planTemplate('product', '2026-11-02', '2027-02-26');
		expect(plan).toHaveLength(7);
		const dated = plan.filter((s) => s.targetDate).map((s) => s.targetDate!);
		expect(dated).toHaveLength(6);
		expect([...dated].sort()).toEqual(dated);
		expect(plan[4].targetDate).toBe('2027-02-26');
		expect(plan.slice(0, 4).every((s) => weekdayOf(s.targetDate!) === 4)).toBe(true);
		expect(plan[5].targetDate! > '2027-02-26').toBe(true);
		expect(plan[6].targetDate).toBeNull();
	});

	it('keeps an express project to two dated steps, even very short', () => {
		const plan = planTemplate('express', '2026-10-19', '2026-10-23');
		expect(plan.map((s) => s.targetDate)).toEqual(['2026-10-22', '2026-10-23']);
	});

	it('leaves everything undated without a delivery date', () => {
		expect(planTemplate('client', '2026-10-19', null).every((s) => !s.targetDate)).toBe(true);
	});

	it('gives every step a "done when" and at most six tasks', () => {
		for (const template of Object.values(TEMPLATES))
			for (const s of template.steps) {
				expect(s.doneWhen).not.toBe('');
				expect(s.tasks.length).toBeLessThanOrEqual(6);
			}
	});
});
