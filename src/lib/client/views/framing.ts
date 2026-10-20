import type {
	Epic,
	Initiative,
	Journey,
	Stakeholder,
	Story,
	Strategy,
	SwotItem,
	Term
} from '$lib/modules/framing/domain/framing';
import { storyRef, storySentence } from '$lib/modules/framing/domain/framing';
import {
	briefSections,
	STARTING_HEADINGS,
	TECH_HEADINGS,
	techSections,
	type Project
} from '$lib/modules/projects/domain/project';
import type { Metric } from '$lib/modules/roadmap/domain/metric';
import type { Milestone } from '$lib/modules/roadmap/domain/milestone';
import type { Component } from '$lib/modules/tasks/domain/component';
import type { Task } from '$lib/modules/tasks/domain/task';

/** Everything framed in one project, as the documents and the checks read it. */
export interface Framed {
	project: Project;
	initiatives: Initiative[];
	epics: Epic[];
	stories: Story[];
	stakeholders: Stakeholder[];
	journeys: Journey[];
	terms: Term[];
	swot: SwotItem[];
	strategies: Strategy[];
	metrics: Metric[];
	components: Component[];
	milestones: Milestone[];
	tasks: Task[];
}

const byPosition = <T extends { position: number }>(items: T[]) =>
	[...items].sort((a, b) => a.position - b.position);

/**
 * Where a story stands, from its tasks (never typed): `todo` while nothing moved, `doing` once
 * work started, `delivered` when its tasks are done and its criteria ticked, `shipped` when that
 * work is in production too.
 */
export type StoryState = 'todo' | 'doing' | 'delivered' | 'shipped';

export function storyState(story: Story, tasks: Task[]): StoryState {
	const work = tasks.filter((t) => t.storyId === story.id && t.status !== 'idea');
	if (!work.length) return 'todo';
	const done = work.every((t) => t.status === 'done') && story.criteria.every((c) => c.done);
	if (!done) return work.some((t) => t.status !== 'todo') ? 'doing' : 'todo';
	return work.every((t) => t.releaseId) ? 'shipped' : 'delivered';
}

export const STORY_STATES: Record<StoryState, { label: string; tone: string }> = {
	todo: { label: 'À faire', tone: 'neutral' },
	doing: { label: 'En cours', tone: 'plan' },
	delivered: { label: 'Livrée', tone: 'ok' },
	shipped: { label: 'En prod', tone: 'ok' }
};

/** The epic a task serves: its story's, or its own. */
export function epicIdOf(task: Pick<Task, 'storyId' | 'epicId'>, stories: Story[]) {
	if (task.storyId) return stories.find((s) => s.id === task.storyId)?.epicId ?? null;
	return task.epicId;
}

/** How far an epic is: its stories delivered (or shipped) out of all. */
export function epicProgress(epic: Epic, stories: Story[], tasks: Task[]) {
	const own = stories.filter((s) => s.epicId === epic.id);
	const delivered = own.filter((s) => {
		const state = storyState(s, tasks);
		return state === 'delivered' || state === 'shipped';
	}).length;
	return { total: own.length, delivered };
}

/**
 * Features added straight on the board, attached to no epic and no story: what the functional
 * spec does not tell yet. Ideas wait, and bugs, tech and actions are not features.
 */
export const toSort = (tasks: Task[]) =>
	tasks.filter(
		(t) =>
			t.kind === 'feature' && t.status !== 'idea' && !t.storyId && !t.epicId && !t.outsideProduct
	);

/** In scope: the epics planned. Out: what we do not do, and the epics for later. */
export function scopeOf(epics: Epic[], brief: string) {
	const ordered = byPosition(epics);
	return {
		inScope: ordered.filter((e) => !e.later),
		later: ordered.filter((e) => e.later),
		notDoing: briefSections(brief)['Ce qu’on ne fait pas']
	};
}

export type GapKind = 'brief' | 'metric' | 'criteria' | 'epic' | 'toSort';

export interface FramingGap {
	kind: GapKind;
	text: string;
	/** Where to fill it, under the project's address. */
	path: string;
}

const MAX_TO_SORT = 5;

/**
 * At most five holes, each with the place to fill it. An express project is only asked why,
 * who and what: framing more would cost more than it saves.
 */
export function framingGaps(f: Framed): FramingGap[] {
	const gaps: FramingGap[] = [];
	const sections = briefSections(f.project.brief);
	const missing = STARTING_HEADINGS.filter((h) => sections[h].length < 10);
	if (missing.length)
		gaps.push({
			kind: 'brief',
			text: `La note de cadrage ne dit pas encore : ${missing.join(', ').toLowerCase()}.`,
			path: '/cadrage'
		});
	if (f.project.kind === 'express') return gaps;
	const vague = f.metrics.filter((m) => !m.archivedAt && m.target === null);
	if (vague.length)
		gaps.push({
			kind: 'metric',
			text: `${vague.length === 1 ? `« ${vague[0].name} » n’a` : `${vague.length} chiffres n’ont`} pas de cible.`,
			path: '/indicateurs'
		});
	const untested = f.stories.filter((s) => !s.criteria.length);
	if (untested.length)
		gaps.push({
			kind: 'criteria',
			text: `${untested.length} ${untested.length === 1 ? 'story n’a' : 'stories n’ont'} pas de critère d’acceptation.`,
			path: '/cadrage/fonctionnel#stories'
		});
	const empty = f.epics.filter((e) => !e.later && !f.stories.some((s) => s.epicId === e.id));
	if (empty.length)
		gaps.push({
			kind: 'epic',
			text: `${empty.length === 1 ? `L’epic « ${empty[0].title} » n’a` : `${empty.length} epics n’ont`} pas encore de story.`,
			path: '/cadrage/fonctionnel#stories'
		});
	const loose = toSort(f.tasks).length;
	if (loose > MAX_TO_SORT)
		gaps.push({
			kind: 'toSort',
			text: `${loose} fonctionnalités ajoutées au tableau ne sont rattachées à rien.`,
			path: '/cadrage/fonctionnel#a-ranger'
		});
	return gaps;
}

/** "Quand", never typed: the delivery date and the step under way. */
export function whenText(
	project: Project,
	current: Milestone | null,
	format: (d: string) => string
) {
	const parts = [
		project.deadline ? `Livraison le ${format(project.deadline)}` : 'Pas de date de livraison',
		current ? `étape en cours : ${current.title}` : null
	];
	return parts.filter(Boolean).join(' · ');
}

/** "Comment", never typed: the first line of the stack and of the hosting. */
export function howText(project: Project) {
	const tech = techSections(project.techSpec);
	const first = (text: string) =>
		text
			.split('\n')
			.find((l) => l.trim())
			?.replace(/^[-*#>\s]+/, '');
	return [first(tech.Stack), first(tech['Hébergement'])].filter(Boolean).join(' · ');
}

/** Criteria with their data: the test set of section 7. */
export function testCases(stories: Story[]) {
	return byPosition(stories).flatMap((story) =>
		story.criteria.filter((c) => c.data || c.expected).map((c) => ({ story, criterion: c }))
	);
}

const personaName = (f: Framed, id: string | null) =>
	f.stakeholders.find((s) => s.id === id)?.name.toLowerCase() ?? null;

const section = (title: string, body: string) => `## ${title}\n\n${body.trim() || '_À écrire._'}\n`;

/** The functional spec as one Markdown document, to send to a client or paste elsewhere. */
export function functionalSpecMarkdown(f: Framed): string {
	const brief = briefSections(f.project.brief);
	const scope = scopeOf(f.epics, f.project.brief);
	const metric = (id: string | null) => f.metrics.find((m) => m.id === id);
	const context = [
		brief.Pourquoi,
		...byPosition(f.initiatives).map((i) => {
			const m = metric(i.metricId);
			return `- **${i.title}**${i.why ? ` : ${i.why}` : ''}${m ? ` (mesuré par ${m.name}${m.target !== null ? `, cible ${m.target} ${m.unit}` : ''})` : ''}`;
		}),
		f.metrics.filter((m) => !m.archivedAt).length
			? `Indicateurs de succès :\n${f.metrics
					.filter((m) => !m.archivedAt)
					.map((m) => `- ${m.name}${m.target !== null ? ` : ${m.target} ${m.unit}` : ''}`)
					.join('\n')}`
			: ''
	].filter(Boolean);
	const personas = f.stakeholders
		.filter((s) => s.role === 'uses')
		.map(
			(p) =>
				`### ${p.name}\n\n${[p.expects && `Besoins : ${p.expects}`, p.techLevel && `Niveau technique : ${{ low: 'faible', medium: 'moyen', high: 'élevé' }[p.techLevel]}`, p.interactions && `Interactions clés : ${p.interactions}`].filter(Boolean).join('\n\n')}`
		);
	const tree = byPosition(f.components.filter((c) => !c.archivedAt && !c.parentId)).map((c) => {
		const parts = byPosition(f.components.filter((p) => p.parentId === c.id && !p.archivedAt));
		return [
			`- **${c.name}**${c.description ? ` : ${c.description}` : ''}`,
			...parts.map((p) => `  - ${p.name}${p.description ? ` : ${p.description}` : ''}`)
		].join('\n');
	});
	const storyBlock = (s: Story) =>
		[
			`#### ${storyRef(s)}`,
			storySentence(s, personaName(f, s.personaId)),
			...s.criteria.map((c) => `- [${c.done ? 'x' : ' '}] ${c.text}`)
		].join('\n\n');
	const epicBlock = (e: Epic) =>
		[
			`### ${e.title}${e.later ? ' (plus tard)' : ''}`,
			e.description,
			...byPosition(f.stories.filter((s) => s.epicId === e.id)).map(storyBlock)
		]
			.filter(Boolean)
			.join('\n\n');
	const backlog = [
		...byPosition(f.initiatives).map((i) =>
			[
				`Initiative : **${i.title}**`,
				...byPosition(f.epics.filter((e) => e.initiativeId === i.id)).map(epicBlock)
			].join('\n\n')
		),
		...byPosition(f.epics.filter((e) => !e.initiativeId)).map(epicBlock),
		...byPosition(f.stories.filter((s) => !s.epicId)).map(storyBlock)
	];
	const tests = testCases(f.stories).map(
		({ story, criterion }) =>
			`- ${storyRef(story)} · ${criterion.text}${criterion.data ? `\n  - Données : ${criterion.data}` : ''}${criterion.expected ? `\n  - Résultat attendu : ${criterion.expected}` : ''}`
	);
	return [
		`# Cahier des charges fonctionnel · ${f.project.name}\n`,
		section('1. Contexte et objectifs', context.join('\n\n')),
		section(
			'2. Périmètre',
			[
				`Inclus :\n${scope.inScope.map((e) => `- ${e.title}`).join('\n') || '- (aucune epic)'}`,
				`Exclu :\n${[scope.notDoing, ...scope.later.map((e) => `- ${e.title} (plus tard)`)].filter(Boolean).join('\n') || '- (rien de précisé)'}`
			].join('\n\n')
		),
		section('3. Personas et acteurs', personas.join('\n\n')),
		section('4. Cartographie des fonctionnalités', tree.join('\n')),
		section('5. Epics et user stories', backlog.join('\n\n')),
		section(
			'6. Parcours utilisateurs',
			byPosition(f.journeys)
				.map((j) => `### ${j.title}\n\n${j.body}`)
				.join('\n\n')
		),
		section('7. Jeu de données de test', tests.join('\n')),
		section(
			'8. Glossaire',
			[...f.terms]
				.sort((a, b) => a.term.localeCompare(b.term, 'fr'))
				.map((t) => `- **${t.term}** : ${t.definition}`)
				.join('\n')
		)
	].join('\n');
}

export function techSpecMarkdown(project: Project): string {
	const tech = techSections(project.techSpec);
	return [
		`# Cahier des charges technique · ${project.name}\n`,
		...TECH_HEADINGS.map((h) => section(h, tech[h]))
	].join('\n');
}

/** "Fini, c'est…": the list of the definition of done, shown on every task. */
export function definitionOfDone(project: Project): string[] {
	return techSections(project.techSpec)
		['Définition de « fini »'].split('\n')
		.map((l) => l.replace(/^\s*(?:[-*•]|\d+[.)])\s+(?:\[[ x]\]\s*)?/, '').trim())
		.filter(Boolean);
}

/**
 * The stories a release completes: every piece of their work ships now or shipped before. The
 * client note opens with them, in the words of the spec the client read.
 */
export function storiesCompletedBy(shipping: Task[], tasks: Task[], stories: Story[]): Story[] {
	const now = new Set(shipping.map((t) => t.id));
	const touched = new Set(shipping.map((t) => t.storyId).filter(Boolean));
	return byPosition(stories.filter((s) => touched.has(s.id))).filter((s) =>
		tasks
			.filter((t) => t.storyId === s.id && t.status !== 'idea')
			.every((t) => now.has(t.id) || t.releaseId)
	);
}

export function storiesNote(stories: Story[], personaOf: (id: string | null) => string | null) {
	if (!stories.length) return '';
	const lines = stories.map((s) => {
		const who = personaOf(s.personaId);
		return `- ${who ? `${who.charAt(0).toUpperCase()}${who.slice(1)} : ` : ''}${s.want.charAt(0).toUpperCase()}${s.want.slice(1)}`;
	});
	return ['## Ce que vous pouvez faire maintenant', ...lines].join('\n');
}
