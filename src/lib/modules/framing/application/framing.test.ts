import { describe, expect, it } from 'vitest';
import { FakeAccess, FixedClock, MemoryTable, RecordingFeed, testId } from '../../kernel/testing';
import { notFound } from '../../kernel/domain/errors';
import { applyPatch, newTask, type Task } from '../../tasks/domain/task';
import { createFraming } from '../index';
import type { FramingFeeds, FramingItems, FramingStores, Store } from './ports';

const P = '10000000-0000-4000-8000-000000000001';
const OTHER = '10000000-0000-4000-8000-000000000002';
const ana = 'ana';
const zoe = 'zoe';

function store<T extends { id: string; projectId: string }>(): Store<T> {
	const table = new MemoryTable<T>();
	return {
		ofProjects: async (ids) => table.all().filter((r) => ids.includes(r.projectId)),
		ofProject: async (id) => table.all().filter((r) => r.projectId === id),
		get: async (id) => table.get(id),
		put: async (item) => table.put(item),
		delete: async (id) => table.delete(id)
	};
}

const KINDS = [
	'initiatives',
	'epics',
	'stories',
	'stakeholders',
	'journeys',
	'terms',
	'swot',
	'strategies'
] as const;

function setup() {
	const clock = new FixedClock();
	const stores = Object.fromEntries(KINDS.map((k) => [k, store()])) as unknown as FramingStores;
	const feeds = Object.fromEntries(
		KINDS.map((k) => [k, new RecordingFeed()])
	) as unknown as FramingFeeds & { [K in keyof FramingItems]: RecordingFeed<FramingItems[K]> };
	const tasks = new MemoryTable<Task>();
	const decisions: string[] = [];
	const hypotheses: string[] = [];
	let storyNumber = 0;
	const framing = createFraming({
		stores,
		feeds,
		nextStoryNumber: async () => ++storyNumber,
		tasks: {
			ofProject: async (id) => tasks.all().filter((t) => t.projectId === id),
			async get(id) {
				const task = tasks.get(id);
				if (!task) throw notFound('Tâche');
				return task;
			},
			async update(id, patch, actorId) {
				const next = applyPatch(tasks.get(id)!, patch, actorId, clock.now());
				tasks.put(next);
				return next;
			}
		},
		neighbours: {
			projectOf: async (_kind, id) => (id === 'metric-p' ? P : null),
			async createHypothesis(_projectId, text) {
				hypotheses.push(text);
				return { id: testId() };
			},
			async decide(_projectId, text) {
				decisions.push(text);
			}
		},
		access: new FakeAccess({ [P]: [ana], [OTHER]: [zoe] }),
		clock,
		newId: testId
	});
	const addTask = (patch: Partial<Task> = {}) => {
		const task = {
			...newTask(
				{ id: testId(), projectId: P, number: 1, title: 'Formulaire de réservation', position: 1 },
				ana,
				clock.now()
			),
			...patch
		};
		tasks.put(task);
		return task;
	};
	return { framing, stores, feeds, tasks, decisions, hypotheses, addTask };
}

describe('framing', () => {
	it('keeps strangers out of a project’s framing', async () => {
		const { framing } = setup();
		await expect(
			framing.createEpic({ id: testId(), projectId: P, title: 'Réservation' }, zoe)
		).rejects.toThrow('Tu ne fais pas partie de ce projet.');
		const epic = await framing.createEpic(
			{ id: testId(), projectId: P, title: 'Réservation' },
			ana
		);
		await expect(framing.updateEpic(epic.id, { title: 'Volé' }, zoe)).rejects.toThrow();
		await expect(framing.deleteEpic(epic.id, zoe)).rejects.toThrow();
	});

	it('refuses links to another project’s items', async () => {
		const { framing } = setup();
		const foreign = await framing.createEpic(
			{ id: testId(), projectId: OTHER, title: 'Ailleurs' },
			zoe
		);
		await expect(
			framing.createStory({ id: testId(), projectId: P, want: 'réserver', epicId: foreign.id }, ana)
		).rejects.toThrow('Epic inconnu(e).');
		await expect(
			framing.createInitiative(
				{ id: testId(), projectId: P, title: 'X', metricId: 'metric-x' },
				ana
			)
		).rejects.toThrow('Chiffre inconnu.');
		const ok = await framing.createInitiative(
			{ id: testId(), projectId: P, title: 'Remplacer le téléphone', metricId: 'metric-p' },
			ana
		);
		expect(ok.metricId).toBe('metric-p');
	});

	it('numbers stories and validates their criteria', async () => {
		const { framing } = setup();
		const a = await framing.createStory({ id: testId(), projectId: P, want: 'réserver' }, ana);
		const b = await framing.createStory({ id: testId(), projectId: P, want: 'annuler' }, ana);
		expect([a.number, b.number]).toEqual([1, 2]);
		await expect(
			framing.updateStory(
				a.id,
				{ criteria: [{ id: 'c', text: '  ', done: false, data: '', expected: '' }] },
				ana
			)
		).rejects.toThrow('Un critère ne peut pas être vide.');
	});

	it('turns a task of the board into a story it keeps building', async () => {
		const { framing, addTask, tasks } = setup();
		const epic = await framing.createEpic(
			{ id: testId(), projectId: P, title: 'Réservation' },
			ana
		);
		const task = addTask({ epicId: epic.id });
		const story = await framing.storyFromTask({ id: testId(), taskId: task.id }, ana);
		expect(story.want).toBe('formulaire de réservation');
		expect(story.epicId).toBe(epic.id);
		expect(tasks.get(task.id)).toMatchObject({ storyId: story.id, epicId: null });
		await expect(framing.storyFromTask({ id: testId(), taskId: task.id }, ana)).rejects.toThrow(
			'déjà sa story'
		);
	});

	it('gives a deleted story’s tasks to its epic', async () => {
		const { framing, addTask, tasks } = setup();
		const epic = await framing.createEpic(
			{ id: testId(), projectId: P, title: 'Réservation' },
			ana
		);
		const story = await framing.createStory(
			{ id: testId(), projectId: P, want: 'réserver', epicId: epic.id },
			ana
		);
		const task = addTask({ storyId: story.id });
		await framing.deleteStory(story.id, ana);
		expect(tasks.get(task.id)).toMatchObject({ storyId: null, epicId: epic.id });
	});

	it('sends a postponed epic’s open work back to the ideas, with a decision', async () => {
		const { framing, addTask, tasks, decisions } = setup();
		const epic = await framing.createEpic({ id: testId(), projectId: P, title: 'Paiement' }, ana);
		const story = await framing.createStory(
			{ id: testId(), projectId: P, want: 'payer', epicId: epic.id },
			ana
		);
		const viaStory = addTask({ storyId: story.id, status: 'todo' });
		const done = addTask({ epicId: epic.id, status: 'done' });
		await framing.updateEpic(epic.id, { later: true, why: 'Pas avant la bêta' }, ana);
		expect(tasks.get(viaStory.id)!.status).toBe('idea');
		expect(tasks.get(done.id)!.status).toBe('done');
		expect(decisions).toEqual(['« Paiement » passe à plus tard']);
	});

	it('detaches what pointed at a deleted epic', async () => {
		const { framing, addTask, tasks, stores } = setup();
		const epic = await framing.createEpic({ id: testId(), projectId: P, title: 'Rappels' }, ana);
		const story = await framing.createStory(
			{ id: testId(), projectId: P, want: 'recevoir un SMS', epicId: epic.id },
			ana
		);
		const task = addTask({ epicId: epic.id });
		await framing.deleteEpic(epic.id, ana);
		expect((await stores.stories.get(story.id))!.epicId).toBeNull();
		expect(tasks.get(task.id)!.epicId).toBeNull();
	});

	it('keeps the SWOT short and the TOWS crossings honest', async () => {
		const { framing, stores, hypotheses } = setup();
		const strength = await framing.createSwotItem(
			{ id: testId(), projectId: P, quadrant: 'S', text: 'Une kiné dans l’équipe' },
			ana
		);
		const threat = await framing.createSwotItem(
			{ id: testId(), projectId: P, quadrant: 'T', text: 'Doctolib baisse ses prix' },
			ana
		);
		for (let i = 0; i < 4; i++)
			await framing.createSwotItem(
				{ id: testId(), projectId: P, quadrant: 'S', text: `S${i}` },
				ana
			);
		await expect(
			framing.createSwotItem({ id: testId(), projectId: P, quadrant: 'S', text: 'De trop' }, ana)
		).rejects.toThrow('5 éléments au plus');
		await expect(
			framing.createStrategy(
				{ id: testId(), projectId: P, kind: 'WO', text: 'X', itemIds: [strength.id] },
				ana
			)
		).rejects.toThrow('ne va pas dans cette case');
		const strategy = await framing.createStrategy(
			{
				id: testId(),
				projectId: P,
				kind: 'ST',
				text: 'Offre solo',
				itemIds: [strength.id, threat.id]
			},
			ana
		);
		const epic = await framing.strategyToEpic(strategy.id, ana);
		expect(epic.title).toBe('Offre solo');
		await framing.strategyToHypothesis(strategy.id, ana);
		expect(hypotheses).toEqual(['Offre solo']);
		await framing.deleteSwotItem(threat.id, ana);
		expect((await stores.strategies.get(strategy.id))!.itemIds).toEqual([strength.id]);
	});

	it('keeps glossary terms unique', async () => {
		const { framing } = setup();
		await framing.createTerm({ id: testId(), projectId: P, term: 'Créneau' }, ana);
		await expect(
			framing.createTerm({ id: testId(), projectId: P, term: 'créneau' }, ana)
		).rejects.toThrow('déjà dans le glossaire');
	});

	it('only links team members to a stakeholder', async () => {
		const { framing } = setup();
		await expect(
			framing.createStakeholder({ id: testId(), projectId: P, name: 'Zoé', userId: zoe }, ana)
		).rejects.toThrow('ne fait pas partie du projet');
		const persona = await framing.createStakeholder(
			{ id: testId(), projectId: P, name: 'Patient', role: 'uses', techLevel: 'low' },
			ana
		);
		expect(persona).toMatchObject({ role: 'uses', influence: 'low', interest: 'high' });
	});
});
