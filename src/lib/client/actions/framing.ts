import type {
	Criterion,
	Epic,
	Initiative,
	Journey,
	Stakeholder,
	StakeholderRole,
	Story,
	Strategy,
	StrategyKind,
	SwotItem,
	SwotQuadrant,
	Term
} from '$lib/modules/framing/domain/framing';
import { requiredText } from '$lib/modules/kernel/domain/errors';
import { errorMessage, send } from '../api';
import type { Collection } from '../state/collection.svelte';
import type { AppState } from '../state/app.svelte';
import { deleteWithUndo, toasts } from '../toasts.svelte';
import { attempt, settle } from './optimistic';

type Patch<T> = Partial<Omit<T, 'id' | 'projectId' | 'createdAt'>>;

/**
 * The framing: note de cadrage, cahiers des charges, SWOT. Every change shows at once; the
 * server answer then rules (it also detaches what pointed at a deleted item).
 */
export function framingActions(app: AppState) {
	const now = () => new Date().toISOString();
	const endOf = (items: { projectId: string; position?: number }[], projectId: string) =>
		Math.max(0, ...items.filter((i) => i.projectId === projectId).map((i) => i.position ?? 0)) + 1;

	/** Shows the item, sends it, keeps the server's version or puts the old one back. */
	function put<T extends { id: string }>(
		collection: Collection<T>,
		next: NoInfer<T>,
		request: () => Promise<NoInfer<T>>,
		previous?: NoInfer<T>
	) {
		collection.upsert(next);
		void settle(
			app,
			next.id,
			request(),
			(saved) => collection.upsert(saved),
			() => (previous ? collection.upsert(previous) : collection.remove(next.id))
		);
		return next;
	}

	function patch<T extends { id: string }>(
		collection: Collection<T>,
		id: string,
		changes: Partial<NoInfer<T>>,
		request: () => Promise<NoInfer<T>>
	) {
		const current = collection.get(id);
		if (!current) return;
		put(collection, { ...current, ...changes }, request, current);
	}

	function remove<T extends { id: string }>(
		collection: Collection<T>,
		item: T,
		message: string,
		request: () => Promise<unknown>
	) {
		deleteWithUndo(
			message,
			() => collection.remove(item.id),
			() => collection.upsert(item),
			() => void request().catch(() => collection.upsert(item))
		);
	}

	async function run<T>(request: Promise<T>): Promise<T | null> {
		try {
			return await request;
		} catch (error) {
			toasts.error(errorMessage(error));
			return null;
		}
	}

	const keep = { keepalive: true };

	return {
		addInitiative(projectId: string, title: string) {
			const item = attempt<Initiative>(() => ({
				id: crypto.randomUUID(),
				projectId,
				title: requiredText(title, 'L’initiative', 120),
				why: '',
				metricId: null,
				position: endOf(app.initiatives.all, projectId),
				createdAt: now()
			}));
			if (!item) return false;
			put(app.initiatives, item, () =>
				send('framing.createInitiative', { id: item.id, projectId, title: item.title })
			);
			return true;
		},
		updateInitiative: (id: string, changes: Patch<Initiative>) =>
			patch(app.initiatives, id, changes, () =>
				send('framing.updateInitiative', { id, ...changes })
			),
		removeInitiative: (item: Initiative) =>
			remove(app.initiatives, item, `Initiative « ${item.title} » supprimée`, () =>
				send('framing.deleteInitiative', { id: item.id }, keep)
			),

		addEpic(projectId: string, title: string, fields: Patch<Epic> = {}) {
			const item = attempt<Epic>(() => ({
				id: crypto.randomUUID(),
				projectId,
				initiativeId: null,
				componentId: null,
				description: '',
				later: false,
				position: endOf(app.epics.all, projectId),
				createdAt: now(),
				...fields,
				title: requiredText(title, 'L’epic', 120)
			}));
			if (!item) return null;
			const { initiativeId, componentId } = item;
			return put(app.epics, item, () =>
				send('framing.createEpic', {
					id: item.id,
					projectId,
					title: item.title,
					initiativeId,
					componentId
				})
			);
		},
		updateEpic: (id: string, changes: Patch<Epic>) =>
			patch(app.epics, id, changes, () => send('framing.updateEpic', { id, ...changes })),
		/** Out of scope for now: its open work goes back to the ideas, with a decision. */
		postponeEpic: (id: string, why: string) =>
			patch(app.epics, id, { later: true }, () =>
				send('framing.updateEpic', { id, later: true, why })
			),
		removeEpic: (item: Epic) =>
			remove(app.epics, item, `Epic « ${item.title} » supprimée, ses stories restent`, () =>
				send('framing.deleteEpic', { id: item.id }, keep)
			),

		addStory(projectId: string, want: string, fields: Patch<Story> = {}) {
			const item = attempt<Story>(() => ({
				id: crypto.randomUUID(),
				projectId,
				number: 0,
				epicId: null,
				personaId: null,
				soThat: '',
				criteria: [],
				position: endOf(app.stories.all, projectId),
				createdAt: now(),
				...fields,
				want: requiredText(want, 'Ce que la personne veut faire', 300)
			}));
			if (!item) return null;
			const { epicId, personaId, soThat, criteria } = item;
			return put(app.stories, item, () =>
				send('framing.createStory', {
					id: item.id,
					projectId,
					want: item.want,
					epicId,
					personaId,
					soThat,
					criteria
				})
			);
		},
		updateStory: (id: string, changes: Patch<Story>) =>
			patch(app.stories, id, changes, () => send('framing.updateStory', { id, ...changes })),
		setCriteria(id: string, criteria: Criterion[]) {
			patch(app.stories, id, { criteria }, () => send('framing.updateStory', { id, criteria }));
		},
		/** The reviewer ticks a criterion while checking the work. */
		toggleCriterion(storyId: string, criterionId: string) {
			const story = app.stories.get(storyId);
			if (!story) return;
			this.setCriteria(
				storyId,
				story.criteria.map((c) => (c.id === criterionId ? { ...c, done: !c.done } : c))
			);
		},
		removeStory: (item: Story) =>
			remove(app.stories, item, 'Story supprimée, ses tâches restent', () =>
				send('framing.deleteStory', { id: item.id }, keep)
			),
		/** "En faire une story": the task stays, and now builds a need of the spec. */
		async storyFromTask(taskId: string, epicId: string | null = null) {
			const story = await run(
				send('framing.storyFromTask', { id: crypto.randomUUID(), taskId, epicId })
			);
			if (story) {
				app.stories.upsert(story);
				toasts.show(`US-${story.number} créée : précise-la dans le cahier des charges`, {
					tone: 'success'
				});
			}
			return story;
		},

		addStakeholder(projectId: string, name: string, role: StakeholderRole = 'uses') {
			const item = attempt<Stakeholder>(() => ({
				id: crypto.randomUUID(),
				projectId,
				name: requiredText(name, 'Le nom', 80),
				organization: '',
				role,
				influence: role === 'decides' || role === 'pays' ? 'high' : 'low',
				interest: 'high',
				expects: '',
				techLevel: null,
				interactions: '',
				informEvery: null,
				userId: null,
				position: endOf(app.stakeholders.all, projectId),
				createdAt: now()
			}));
			if (!item) return false;
			const { influence, interest } = item;
			put(app.stakeholders, item, () =>
				send('framing.createStakeholder', {
					id: item.id,
					projectId,
					name: item.name,
					role,
					influence,
					interest
				})
			);
			return true;
		},
		updateStakeholder: (id: string, changes: Patch<Stakeholder>) =>
			patch(app.stakeholders, id, changes, () =>
				send('framing.updateStakeholder', { id, ...changes })
			),
		removeStakeholder: (item: Stakeholder) =>
			remove(app.stakeholders, item, `« ${item.name} » retiré`, () =>
				send('framing.deleteStakeholder', { id: item.id }, keep)
			),

		addJourney(projectId: string, title: string) {
			const item = attempt<Journey>(() => ({
				id: crypto.randomUUID(),
				projectId,
				title: requiredText(title, 'Le parcours', 120),
				body: '',
				position: endOf(app.journeys.all, projectId),
				createdAt: now()
			}));
			if (!item) return false;
			put(app.journeys, item, () =>
				send('framing.createJourney', { id: item.id, projectId, title: item.title })
			);
			return true;
		},
		updateJourney: (id: string, changes: Patch<Journey>) =>
			patch(app.journeys, id, changes, () => send('framing.updateJourney', { id, ...changes })),
		removeJourney: (item: Journey) =>
			remove(app.journeys, item, `Parcours « ${item.title} » supprimé`, () =>
				send('framing.deleteJourney', { id: item.id }, keep)
			),

		addTerm(projectId: string, term: string, definition = '') {
			const item = attempt<Term>(() => ({
				id: crypto.randomUUID(),
				projectId,
				term: requiredText(term, 'Le terme', 60),
				definition,
				createdAt: now()
			}));
			if (!item) return false;
			put(app.terms, item, () =>
				send('framing.createTerm', { id: item.id, projectId, term: item.term, definition })
			);
			return true;
		},
		updateTerm: (id: string, changes: Patch<Term>) =>
			patch(app.terms, id, changes, () => send('framing.updateTerm', { id, ...changes })),
		removeTerm: (item: Term) =>
			remove(app.terms, item, `« ${item.term} » retiré du glossaire`, () =>
				send('framing.deleteTerm', { id: item.id }, keep)
			),

		addSwotItem(projectId: string, quadrant: SwotQuadrant, text: string) {
			const item = attempt<SwotItem>(() => ({
				id: crypto.randomUUID(),
				projectId,
				quadrant,
				text: requiredText(text, 'Cet élément', 160),
				position: endOf(app.swot.all, projectId),
				createdAt: now()
			}));
			if (!item) return false;
			put(app.swot, item, () =>
				send('framing.createSwotItem', { id: item.id, projectId, quadrant, text: item.text })
			);
			return true;
		},
		updateSwotItem: (id: string, text: string) =>
			patch(app.swot, id, { text }, () => send('framing.updateSwotItem', { id, text })),
		removeSwotItem: (item: SwotItem) =>
			remove(app.swot, item, 'Élément retiré', () =>
				send('framing.deleteSwotItem', { id: item.id }, keep)
			),

		addStrategy(projectId: string, kind: StrategyKind, text: string, itemIds: string[] = []) {
			const item = attempt<Strategy>(() => ({
				id: crypto.randomUUID(),
				projectId,
				kind,
				text: requiredText(text, 'La stratégie', 200),
				itemIds,
				epicId: null,
				hypothesisId: null,
				createdAt: now()
			}));
			if (!item) return false;
			put(app.strategies, item, () =>
				send('framing.createStrategy', { id: item.id, projectId, kind, text: item.text, itemIds })
			);
			return true;
		},
		updateStrategy: (id: string, changes: { text?: string; itemIds?: string[] }) =>
			patch(app.strategies, id, changes, () => send('framing.updateStrategy', { id, ...changes })),
		removeStrategy: (item: Strategy) =>
			remove(app.strategies, item, 'Stratégie retirée', () =>
				send('framing.deleteStrategy', { id: item.id }, keep)
			),
		async strategyToEpic(id: string) {
			const epic = await run(send('framing.strategyToEpic', { id }));
			if (epic) {
				app.epics.upsert(epic);
				const strategy = app.strategies.get(id);
				if (strategy) app.strategies.upsert({ ...strategy, epicId: epic.id });
				toasts.show(`Epic « ${epic.title} » ajoutée au cahier des charges`, { tone: 'success' });
			}
		},
		async strategyToHypothesis(id: string) {
			const strategy = await run(send('framing.strategyToHypothesis', { id }));
			if (strategy) {
				app.strategies.upsert(strategy);
				toasts.show('Pari ajouté : il est à vérifier dans la note de cadrage', { tone: 'success' });
			}
		}
	};
}
