import { describe, expect, it } from 'vitest';
import { weekdayOf } from '../../kernel/domain/dates';
import {
	carriedOver,
	currentMilestone,
	datedBeforePrevious,
	dateChange,
	nextMilestone,
	orderMilestones,
	positionForNew,
	progressOf,
	startedAt,
	type Milestone
} from './milestone';
import { parseMetricLine } from './metric';
import { changelogOf, clientNoteOf, nextVersion, shippable, toTell } from './release';
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
		step('core', { targetDate: '2026-12-04', position: 2 }),
		step('proof', { targetDate: '2026-11-13', closedAt: '2026-11-12T10:00:00Z', position: 1 }),
		step('later', { position: 3 })
	];

	it('keeps the order the team set, whatever the dates', () => {
		expect(orderMilestones(steps).map((m) => m.id)).toEqual(['proof', 'core', 'later', 'life']);
		const swapped = steps.map((m) => (m.id === 'core' ? { ...m, position: 5 } : m));
		expect(orderMilestones(swapped).map((m) => m.id)).toEqual(['proof', 'later', 'core', 'life']);
		expect(datedBeforePrevious(swapped, 'core')).toBe(false);
		const early = steps.map((m) => (m.id === 'later' ? { ...m, targetDate: '2026-11-20' } : m));
		expect(datedBeforePrevious(early, 'later')).toBe(true);
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

	it('adds an undated step at the end, a dated one before the open steps due later', () => {
		const order = (extra: Partial<Milestone>) =>
			orderMilestones([
				...steps,
				step('new', { ...extra, position: positionForNew(steps, extra.targetDate ?? null) })
			]).map((m) => m.id);
		expect(order({}).at(-1)).toBe('new');
		expect(order({ targetDate: '2026-11-27' })).toEqual(['proof', 'new', 'core', 'later', 'life']);
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

describe('releases', () => {
	const shipped = [
		{
			number: 12,
			title: 'Prise de RDV en ligne',
			kind: 'feature' as const,
			reportedBy: null,
			componentId: 'rdv'
		},
		{
			number: 14,
			title: 'Horaires du samedi',
			kind: 'bug' as const,
			reportedBy: 'Pharmacie Martin',
			componentId: null
		},
		{
			number: 15,
			title: 'Mise à jour de Svelte',
			kind: 'tech' as const,
			reportedBy: null,
			componentId: null
		}
	];
	const moduleOf = (id: string | null) => (id === 'rdv' ? 'RDV' : null);

	it('names the next version from what ships', () => {
		expect(nextVersion(null, ['bug'])).toBe('v1.0');
		expect(nextVersion('v1.3', ['bug', 'feature'])).toBe('v1.4');
		expect(nextVersion('v1.3', ['bug'])).toBe('v1.3.1');
		expect(nextVersion('1.3.1', ['tech'])).toBe('1.3.2');
		expect(nextVersion('Mise en ligne', ['feature'])).toBe('');
	});

	it('writes the changelog for the team and a note for the clients', () => {
		const log = changelogOf('v1.4', shipped, moduleOf);
		expect(log).toContain('# v1.4');
		expect(log).toContain('- RDV : Prise de RDV en ligne (#12)');
		expect(log).toContain('- Horaires du samedi (#14, signalé par Pharmacie Martin)');
		expect(log).toContain('## Technique');
		const note = clientNoteOf(shipped, moduleOf);
		expect(note).not.toContain('Svelte');
		expect(note).not.toMatch(/#\d/);
		expect(note).toContain('## Corrections');
	});

	it('lists who to tell, once each', () => {
		expect(toTell([...shipped, { ...shipped[1], number: 16 }])).toEqual(['Pharmacie Martin']);
	});

	it('only ships finished code not shipped yet', () => {
		expect(shippable({ status: 'done', kind: 'bug', releaseId: null })).toBe(true);
		expect(shippable({ status: 'done', kind: 'action', releaseId: null })).toBe(false);
		expect(shippable({ status: 'review', kind: 'feature', releaseId: null })).toBe(false);
		expect(shippable({ status: 'done', kind: 'feature', releaseId: 'v1' })).toBe(false);
	});
});

describe('metrics', () => {
	it('reads a target and a unit at the end of a line', () => {
		expect(parseMetricLine('clients payants 50')).toEqual({
			name: 'clients payants',
			target: 50,
			unit: ''
		});
		expect(parseMetricLine('MRR 2 500 €')).toEqual({ name: 'MRR', target: 2500, unit: '€' });
		expect(parseMetricLine('Churn 3,5 %')).toEqual({ name: 'Churn', target: 3.5, unit: '%' });
		expect(parseMetricLine('Pharmacies actives')).toEqual({
			name: 'Pharmacies actives',
			target: null,
			unit: ''
		});
	});
});
