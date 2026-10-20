import { describe, expect, it } from 'vitest';
import { newTask } from '../../tasks/domain/task';
import type { Project } from '../../projects/domain/project';
import { buildContext, resolveAliases, targetText, tokensOf, type ProjectData } from './context';
import { cleanProposal, type RawProposal } from './proposal';
import { costLabel, costMicros } from './pricing';
import { ACTIONS } from './actions';
import { OP_COMMANDS } from './ops';

let n = 0;
const id = () => `00000000-0000-4000-8000-${String(++n).padStart(12, '0')}`;
const raw = (ops: RawProposal['ops']): RawProposal => ({
	summary: 'ok',
	verdict: 'none',
	questions: [],
	ops
});
const op = (command: string, input: object, ref = '') => ({
	command,
	ref,
	input: JSON.stringify(input),
	reason: 'parce que',
	sources: ['#1']
});
const clean = (r: RawProposal, allowed = OP_COMMANDS, aliases = new Map<string, string>()) =>
	cleanProposal(r, { allowed, aliases, newId: id });

const project: Project = {
	id: 'p',
	slug: 'p',
	name: 'RDV Kiné',
	description: '',
	color: 0,
	kind: 'product',
	deadline: null,
	weekGoal: '',
	brief: '## Pourquoi\n\nLe téléphone',
	techSpec: '',
	soldDays: null,
	shipChecklist: [],
	archivedAt: null,
	createdBy: 'me',
	createdAt: ''
};
const data = (patch: Partial<ProjectData> = {}): ProjectData => ({
	project,
	today: '2026-10-20',
	members: [{ id: 'u', name: 'Bastien Grenot' }],
	milestones: [],
	tasks: [],
	decisions: [],
	hypotheses: [],
	metrics: [],
	components: [],
	initiatives: [],
	epics: [],
	stories: [],
	stakeholders: [],
	swot: [],
	strategies: [],
	terms: [],
	journeys: [],
	...patch
});

describe('the assistant’s white list', () => {
	it('never lets a deletion, an assignment or a finished task through', () => {
		const p = clean(
			raw([
				op('tasks.delete', { id: id() }),
				op('tasks.update', { id: id(), assigneeId: id() }),
				op('tasks.update', { id: id(), status: 'done' }),
				op('vault.reveal', { id: id() }),
				op('tasks.update', { id: id(), status: 'todo', title: 'Écrire la page' })
			])
		);
		expect(p.ops.map((o) => o.command)).toEqual(['tasks.update']);
		expect(p.dropped).toBe(4);
	});

	it('keeps only the commands of the button', () => {
		const p = clean(raw([op('roadmap.createHypothesis', { text: 'Ils paieront' })]), [
			'tasks.create'
		]);
		expect(p.ops).toHaveLength(0);
	});

	it('refuses a step date that moves without its why', () => {
		const step = id();
		const p = clean(
			raw([
				op('roadmap.updateMilestone', { id: step, targetDate: '2026-12-01' }),
				op('roadmap.updateMilestone', {
					id: step,
					targetDate: '2026-12-01',
					reason: '2 tâches/sem.'
				})
			])
		);
		expect(p.ops).toHaveLength(1);
	});

	it('links ops with $ref, and drops what points at a dropped op', () => {
		const p = clean(
			raw([
				op('framing.createEpic', { title: 'Réservation' }, 'e1'),
				op('framing.createStory', { want: 'réserver', epicId: '$e1' }),
				op('framing.createStory', { want: 'annuler', epicId: '$e9' })
			])
		);
		expect(p.ops.map((o) => o.input)).toEqual([
			{ title: 'Réservation' },
			{ want: 'réserver', epicId: '$e1' }
		]);
	});

	it('caps new tasks at fifteen and bets at three', () => {
		const tasks = Array.from({ length: 20 }, (_, i) => op('tasks.create', { title: `T${i}` }));
		const bets = Array.from({ length: 5 }, (_, i) =>
			op('roadmap.createHypothesis', { text: `H${i}` })
		);
		const p = clean(raw([...tasks, ...bets]));
		expect(p.ops.filter((o) => o.command === 'tasks.create')).toHaveLength(15);
		expect(p.ops.filter((o) => o.command === 'roadmap.createHypothesis')).toHaveLength(3);
	});

	it('turns the short names of the context back into ids, in link fields only', () => {
		const aliases = new Map([
			['#12', 'task-id'],
			['E1', 'epic-id']
		]);
		expect(resolveAliases({ id: '#12', epicId: 'E1', title: 'E1' }, aliases)).toEqual({
			id: 'task-id',
			epicId: 'epic-id',
			title: 'E1'
		});
	});
});

describe('the assistant’s context', () => {
	it('keeps to its budget and never reads task notes', () => {
		const tasks = Array.from({ length: 400 }, (_, i) => ({
			...newTask(
				{
					id: id(),
					projectId: 'p',
					number: i + 1,
					title: `Tâche numéro ${i} avec un titre`,
					notes: 'SECRET NOTE',
					position: i
				},
				'u',
				new Date()
			)
		}));
		const built = buildContext(data({ tasks }), 2_000, { withTasks: true, now: new Date() });
		expect(tokensOf(built.text)).toBeLessThanOrEqual(2_010);
		expect(built.text).not.toContain('SECRET NOTE');
		expect(built.text).toContain('autres tâches non listées');
		expect(built.aliases.get('#1')).toBe(tasks[0].id);
	});

	it('reads the targeted task in full', () => {
		const task = newTask(
			{
				id: id(),
				projectId: 'p',
				number: 7,
				title: 'Le truc des gardes',
				notes: 'marche pas sur tel',
				position: 1
			},
			'u',
			new Date()
		);
		const built = buildContext(data({ tasks: [task] }), 4_000, { now: new Date() });
		expect(targetText('task', task.id, data({ tasks: [task] }), built.aliases)).toContain(
			'marche pas sur tel'
		);
	});

	it('gives every button a context budget the model can hold', () => {
		for (const spec of Object.values(ACTIONS))
			expect(spec.contextBudget + spec.maxTokens).toBeLessThan(40_000);
	});
});

describe('the assistant’s cost', () => {
	it('prices in micro-dollars and speaks in cents', () => {
		expect(costMicros('small', { input: 10_000, output: 2_000, cacheWrite: 0, cacheRead: 0 })).toBe(
			2_000
		);
		expect(costMicros('large', { input: 0, output: 0, cacheWrite: 0, cacheRead: 10_000 })).toBe(
			2_000
		);
		expect(costLabel(2_000)).toBe('moins d’un centime');
		expect(costLabel(52_000)).toBe('≈ 5 centimes');
	});
});
