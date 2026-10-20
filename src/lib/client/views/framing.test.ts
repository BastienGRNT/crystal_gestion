import { describe, expect, it } from 'vitest';
import type { Epic, Story } from '$lib/modules/framing/domain/framing';
import { joinBrief, briefSections, type Project } from '$lib/modules/projects/domain/project';
import { newTask, type Task } from '$lib/modules/tasks/domain/task';
import {
	definitionOfDone,
	epicIdOf,
	framingGaps,
	storiesCompletedBy,
	storiesNote,
	functionalSpecMarkdown,
	storyState,
	toSort,
	type Framed
} from './framing';

const at = new Date('2026-10-19T09:00:00Z');
let n = 0;
const task = (patch: Partial<Task> = {}): Task => ({
	...newTask(
		{ id: `t${++n}`, projectId: 'p', number: n, title: `Tâche ${n}`, position: n },
		'me',
		at
	),
	...patch
});
const story = (patch: Partial<Story> = {}): Story => ({
	id: `s${++n}`,
	projectId: 'p',
	number: n,
	epicId: null,
	personaId: null,
	want: 'réserver sans compte',
	soThat: 'ne pas abandonner',
	criteria: [],
	position: n,
	createdAt: '',
	...patch
});
const epic = (patch: Partial<Epic> = {}): Epic => ({
	id: `e${++n}`,
	projectId: 'p',
	initiativeId: null,
	componentId: null,
	title: 'Réservation',
	description: '',
	later: false,
	position: n,
	createdAt: '',
	...patch
});
const project = (patch: Partial<Project> = {}): Project => ({
	id: 'p',
	slug: 'p',
	name: 'RDV Kiné',
	description: '',
	color: 0,
	kind: 'product',
	deadline: null,
	weekGoal: '',
	brief: '',
	techSpec: '',
	soldDays: null,
	shipChecklist: [],
	archivedAt: null,
	createdBy: 'me',
	createdAt: '',
	...patch
});
const framed = (patch: Partial<Framed> = {}): Framed => ({
	project: project(),
	initiatives: [],
	epics: [],
	stories: [],
	stakeholders: [],
	journeys: [],
	terms: [],
	swot: [],
	strategies: [],
	metrics: [],
	components: [],
	milestones: [],
	tasks: [],
	...patch
});

describe('framing views', () => {
	it('tells where a story stands from its tasks and criteria', () => {
		const s = story({ criteria: [{ id: 'c', text: 'ok', done: false, data: '', expected: '' }] });
		expect(storyState(s, [])).toBe('todo');
		expect(storyState(s, [task({ storyId: s.id, status: 'doing' })])).toBe('doing');
		const done = task({ storyId: s.id, status: 'done' });
		expect(storyState(s, [done])).toBe('doing');
		const ticked = { ...s, criteria: [{ ...s.criteria[0], done: true }] };
		expect(storyState(ticked, [done])).toBe('delivered');
		expect(storyState(ticked, [{ ...done, releaseId: 'v1' }])).toBe('shipped');
	});

	it('finds a task’s epic through its story', () => {
		const s = story({ epicId: 'e1' });
		expect(epicIdOf({ storyId: s.id, epicId: null }, [s])).toBe('e1');
		expect(epicIdOf({ storyId: null, epicId: 'e2' }, [s])).toBe('e2');
	});

	it('lists the features to sort, never ideas, bugs or what is outside the product', () => {
		const loose = task();
		const list = toSort([
			loose,
			task({ status: 'idea' }),
			task({ kind: 'bug' }),
			task({ epicId: 'e' }),
			task({ outsideProduct: true })
		]);
		expect(list).toEqual([loose]);
	});

	it('asks an express project only why, who and what', () => {
		const gaps = framingGaps(
			framed({
				project: project({ kind: 'express' }),
				stories: [story()],
				tasks: Array.from({ length: 8 }, () => task())
			})
		);
		expect(gaps.map((g) => g.kind)).toEqual(['brief']);
	});

	it('names the holes of a product, at most five', () => {
		const brief = joinBrief({
			...briefSections(''),
			Pourquoi: 'Les RDV au téléphone',
			Qui: 'Les kinés seuls',
			Quoi: 'La réservation en ligne'
		});
		const e = epic();
		const gaps = framingGaps(
			framed({
				project: project({ brief }),
				epics: [e, epic({ later: true })],
				stories: [story()],
				tasks: Array.from({ length: 6 }, () => task())
			})
		);
		expect(gaps.map((g) => g.kind)).toEqual(['criteria', 'epic', 'toSort']);
		expect(gaps[1].text).toBe('L’epic « Réservation » n’a pas encore de story.');
	});

	it('writes the functional spec with its eight sections', () => {
		const e = epic({ title: 'Réservation patient' });
		const text = functionalSpecMarkdown(
			framed({
				epics: [e],
				stories: [
					story({
						epicId: e.id,
						number: 7,
						criteria: [
							{
								id: 'c',
								text: 'Le RDV est créé',
								done: true,
								data: 'Paul, 9 h',
								expected: 'RDV à 9 h'
							}
						]
					})
				]
			})
		);
		expect(text).toContain('## 5. Epics et user stories');
		expect(text).toContain('#### US-7');
		expect(text).toContain(
			'En tant que utilisateur, je veux réserver sans compte afin de ne pas abandonner.'
		);
		expect(text).toContain('- US-7 · Le RDV est créé\n  - Données : Paul, 9 h');
		expect(text.match(/^## /gm)).toHaveLength(8);
	});

	it('reads the definition of done as a list', () => {
		const p = project({
			techSpec:
				'## Définition de « fini »\n\n- Testé sur téléphone\n- [ ] Relu\n\n## Stack\n\nSvelte'
		});
		expect(definitionOfDone(p)).toEqual(['Testé sur téléphone', 'Relu']);
	});

	it('opens the client note with the stories a release completes', () => {
		const s = story({ want: 'réserver sans compte', personaId: 'patient' });
		const other = story({ want: 'annuler' });
		const front = task({ storyId: s.id, status: 'done' });
		const back = task({ storyId: s.id, status: 'done', releaseId: 'v1' });
		const half = task({ storyId: other.id, status: 'done' });
		const pending = task({ storyId: other.id, status: 'doing' });
		const all = [front, back, half, pending];
		const done = storiesCompletedBy([front, half], all, [s, other]);
		expect(done).toEqual([s]);
		expect(storiesNote(done, () => 'patient')).toBe(
			'## Ce que vous pouvez faire maintenant\n- Patient : Réserver sans compte'
		);
	});
});
