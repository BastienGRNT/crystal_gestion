import { conflict } from '../../kernel/domain/errors';
import {
	optionalText,
	validCriteria,
	validTitleOf,
	type Criterion,
	type Epic,
	type Initiative,
	type Story
} from '../domain/framing';
import {
	defined,
	drop,
	existing,
	inProject,
	neighbourInProject,
	nextPosition,
	save
} from './helpers';
import type { FramingDeps } from './ports';

const validInitiativeTitle = validTitleOf('L’initiative');
const validEpicTitle = validTitleOf('L’epic');
const validWant = validTitleOf('Ce que la personne veut faire', 300);

export interface InitiativeFields {
	title: string;
	why: string;
	metricId: string | null;
	position: number;
}

export const createInitiative =
	(deps: FramingDeps) =>
	async (
		input: { id: string; projectId: string } & Partial<InitiativeFields> & { title: string },
		actorId: string
	) => {
		await deps.access.assertMember(input.projectId, actorId);
		await neighbourInProject(deps, 'metric', input.metricId, input.projectId);
		return save(deps, 'initiatives', {
			id: input.id,
			projectId: input.projectId,
			title: validInitiativeTitle(input.title),
			why: optionalText(input.why ?? '', 'Le pourquoi', 1000),
			metricId: input.metricId ?? null,
			position: await nextPosition(deps, 'initiatives', input.projectId),
			createdAt: deps.clock.now().toISOString()
		});
	};

export const updateInitiative =
	(deps: FramingDeps) => async (id: string, patch: Partial<InitiativeFields>, actorId: string) => {
		const current = await existing(deps, 'initiatives', id, actorId);
		if (patch.metricId !== undefined)
			await neighbourInProject(deps, 'metric', patch.metricId, current.projectId);
		const next: Initiative = {
			...current,
			...defined(patch),
			...(patch.title !== undefined && { title: validInitiativeTitle(patch.title) }),
			...(patch.why !== undefined && { why: optionalText(patch.why, 'Le pourquoi', 1000) })
		};
		return save(deps, 'initiatives', next);
	};

/** Its epics stay, without an initiative. */
export const deleteInitiative = (deps: FramingDeps) => async (id: string, actorId: string) => {
	const initiative = await existing(deps, 'initiatives', id, actorId);
	for (const epic of await deps.stores.epics.ofProject(initiative.projectId))
		if (epic.initiativeId === id) await save(deps, 'epics', { ...epic, initiativeId: null });
	await drop(deps, 'initiatives', initiative);
};

export interface EpicFields {
	title: string;
	description: string;
	initiativeId: string | null;
	componentId: string | null;
	later: boolean;
	position: number;
}

export const createEpic =
	(deps: FramingDeps) =>
	async (
		input: { id: string; projectId: string } & Partial<EpicFields> & { title: string },
		actorId: string
	) => {
		await deps.access.assertMember(input.projectId, actorId);
		await inProject(deps, 'initiatives', input.initiativeId, input.projectId);
		await neighbourInProject(deps, 'component', input.componentId, input.projectId);
		return save(deps, 'epics', {
			id: input.id,
			projectId: input.projectId,
			initiativeId: input.initiativeId ?? null,
			componentId: input.componentId ?? null,
			title: validEpicTitle(input.title),
			description: optionalText(input.description ?? '', 'La description', 4000),
			later: input.later ?? false,
			position: await nextPosition(deps, 'epics', input.projectId),
			createdAt: deps.clock.now().toISOString()
		});
	};

/** What leaves the scope goes back to the ideas: nobody works on a postponed epic. */
async function postpone(deps: FramingDeps, epic: Epic, why: string, actorId: string) {
	const stories = new Set(
		(await deps.stores.stories.ofProject(epic.projectId))
			.filter((s) => s.epicId === epic.id)
			.map((s) => s.id)
	);
	for (const task of await deps.tasks.ofProject(epic.projectId)) {
		const inEpic = task.epicId === epic.id || (task.storyId && stories.has(task.storyId));
		if (inEpic && (task.status === 'todo' || task.status === 'doing'))
			await deps.tasks.update(task.id, { status: 'idea' }, actorId);
	}
	await deps.neighbours.decide(epic.projectId, `« ${epic.title} » passe à plus tard`, why, actorId);
}

export const updateEpic =
	(deps: FramingDeps) =>
	async (id: string, patch: Partial<EpicFields> & { why?: string }, actorId: string) => {
		const current = await existing(deps, 'epics', id, actorId);
		const { why, ...fields } = patch;
		if (fields.initiativeId !== undefined)
			await inProject(deps, 'initiatives', fields.initiativeId, current.projectId);
		if (fields.componentId !== undefined)
			await neighbourInProject(deps, 'component', fields.componentId, current.projectId);
		const next: Epic = {
			...current,
			...defined(fields),
			...(fields.title !== undefined && { title: validEpicTitle(fields.title) }),
			...(fields.description !== undefined && {
				description: optionalText(fields.description, 'La description', 4000)
			})
		};
		await save(deps, 'epics', next);
		if (next.later && !current.later) await postpone(deps, next, why ?? '', actorId);
		return next;
	};

/** Its stories and tasks stay, without an epic: they come back to "à ranger". */
export const deleteEpic = (deps: FramingDeps) => async (id: string, actorId: string) => {
	const epic = await existing(deps, 'epics', id, actorId);
	for (const story of await deps.stores.stories.ofProject(epic.projectId))
		if (story.epicId === id) await save(deps, 'stories', { ...story, epicId: null });
	for (const strategy of await deps.stores.strategies.ofProject(epic.projectId))
		if (strategy.epicId === id) await save(deps, 'strategies', { ...strategy, epicId: null });
	for (const task of await deps.tasks.ofProject(epic.projectId))
		if (task.epicId === id) await deps.tasks.update(task.id, { epicId: null }, actorId);
	await drop(deps, 'epics', epic);
};

export interface StoryFields {
	epicId: string | null;
	personaId: string | null;
	want: string;
	soThat: string;
	criteria: Criterion[];
	position: number;
}

async function checkStoryLinks(deps: FramingDeps, projectId: string, fields: Partial<StoryFields>) {
	if (fields.epicId !== undefined) await inProject(deps, 'epics', fields.epicId, projectId);
	if (fields.personaId !== undefined)
		await inProject(deps, 'stakeholders', fields.personaId, projectId);
}

export const createStory =
	(deps: FramingDeps) =>
	async (
		input: { id: string; projectId: string } & Partial<StoryFields> & { want: string },
		actorId: string
	) => {
		await deps.access.assertMember(input.projectId, actorId);
		await checkStoryLinks(deps, input.projectId, input);
		const story: Story = {
			id: input.id,
			projectId: input.projectId,
			number: 0,
			epicId: input.epicId ?? null,
			personaId: input.personaId ?? null,
			want: validWant(input.want),
			soThat: optionalText(input.soThat ?? '', 'Le bénéfice', 300),
			criteria: validCriteria(input.criteria ?? []),
			position: await nextPosition(deps, 'stories', input.projectId),
			createdAt: deps.clock.now().toISOString()
		};
		return save(deps, 'stories', { ...story, number: await deps.nextStoryNumber(input.projectId) });
	};

export const updateStory =
	(deps: FramingDeps) => async (id: string, patch: Partial<StoryFields>, actorId: string) => {
		const current = await existing(deps, 'stories', id, actorId);
		await checkStoryLinks(deps, current.projectId, patch);
		const next: Story = {
			...current,
			...defined(patch),
			...(patch.want !== undefined && { want: validWant(patch.want) }),
			...(patch.soThat !== undefined && {
				soThat: optionalText(patch.soThat, 'Le bénéfice', 300)
			}),
			...(patch.criteria !== undefined && { criteria: validCriteria(patch.criteria) })
		};
		return save(deps, 'stories', next);
	};

/** Its tasks stay in its epic. */
export const deleteStory = (deps: FramingDeps) => async (id: string, actorId: string) => {
	const story = await existing(deps, 'stories', id, actorId);
	for (const task of await deps.tasks.ofProject(story.projectId))
		if (task.storyId === id)
			await deps.tasks.update(task.id, { storyId: null, epicId: story.epicId }, actorId);
	await drop(deps, 'stories', story);
};

/** "En faire une story": the task added on the board becomes a need of the spec, and stays its work. */
export const storyFromTask =
	(deps: FramingDeps) =>
	async (input: { id: string; taskId: string; epicId?: string | null }, actorId: string) => {
		const task = await deps.tasks.get(input.taskId, actorId);
		if (task.storyId) throw conflict('Cette tâche a déjà sa story.');
		const story = await createStory(deps)(
			{
				id: input.id,
				projectId: task.projectId,
				want: task.title.charAt(0).toLowerCase() + task.title.slice(1),
				epicId: input.epicId ?? task.epicId ?? null
			},
			actorId
		);
		await deps.tasks.update(task.id, { storyId: story.id, epicId: null }, actorId);
		return story;
	};
