import { conflict, ensure } from '../../kernel/domain/errors';
import {
	ensureRoomInQuadrant,
	fitsStrategy,
	validTitleOf,
	type Strategy,
	type StrategyKind,
	type SwotQuadrant
} from '../domain/framing';
import { createEpic } from './backlog';
import { drop, existing, nextPosition, save } from './helpers';
import type { FramingDeps } from './ports';

const validItem = validTitleOf('Cet élément', 160);
const validStrategy = validTitleOf('La stratégie', 200);

export const createSwotItem =
	(deps: FramingDeps) =>
	async (
		input: { id: string; projectId: string; quadrant: SwotQuadrant; text: string },
		actorId: string
	) => {
		await deps.access.assertMember(input.projectId, actorId);
		ensureRoomInQuadrant(await deps.stores.swot.ofProject(input.projectId), input.quadrant);
		return save(deps, 'swot', {
			id: input.id,
			projectId: input.projectId,
			quadrant: input.quadrant,
			text: validItem(input.text),
			position: await nextPosition(deps, 'swot', input.projectId),
			createdAt: deps.clock.now().toISOString()
		});
	};

export const updateSwotItem =
	(deps: FramingDeps) =>
	async (id: string, patch: { text?: string; position?: number }, actorId: string) => {
		const current = await existing(deps, 'swot', id, actorId);
		return save(deps, 'swot', {
			...current,
			...(patch.text !== undefined && { text: validItem(patch.text) }),
			...(patch.position !== undefined && { position: patch.position })
		});
	};

/** The strategies built on it lose that link; what they led to stays. */
export const deleteSwotItem = (deps: FramingDeps) => async (id: string, actorId: string) => {
	const item = await existing(deps, 'swot', id, actorId);
	for (const strategy of await deps.stores.strategies.ofProject(item.projectId))
		if (strategy.itemIds.includes(id))
			await save(deps, 'strategies', {
				...strategy,
				itemIds: strategy.itemIds.filter((i) => i !== id)
			});
	await drop(deps, 'swot', item);
};

/** Each crossed item exists in the project and belongs to a family the strategy crosses. */
async function validItems(
	deps: FramingDeps,
	projectId: string,
	kind: StrategyKind,
	itemIds: string[]
) {
	ensure(itemIds.length <= 6, '6 éléments croisés au plus.');
	const items = new Map((await deps.stores.swot.ofProject(projectId)).map((i) => [i.id, i]));
	for (const id of itemIds) {
		const item = items.get(id);
		ensure(item && fitsStrategy(kind, item.quadrant), 'Cet élément ne va pas dans cette case.');
	}
	return [...new Set(itemIds)];
}

export const createStrategy =
	(deps: FramingDeps) =>
	async (
		input: {
			id: string;
			projectId: string;
			kind: StrategyKind;
			text: string;
			itemIds?: string[];
		},
		actorId: string
	) => {
		await deps.access.assertMember(input.projectId, actorId);
		return save(deps, 'strategies', {
			id: input.id,
			projectId: input.projectId,
			kind: input.kind,
			text: validStrategy(input.text),
			itemIds: await validItems(deps, input.projectId, input.kind, input.itemIds ?? []),
			epicId: null,
			hypothesisId: null,
			createdAt: deps.clock.now().toISOString()
		});
	};

export const updateStrategy =
	(deps: FramingDeps) =>
	async (id: string, patch: { text?: string; itemIds?: string[] }, actorId: string) => {
		const current = await existing(deps, 'strategies', id, actorId);
		const next: Strategy = {
			...current,
			...(patch.text !== undefined && { text: validStrategy(patch.text) }),
			...(patch.itemIds !== undefined && {
				itemIds: await validItems(deps, current.projectId, current.kind, patch.itemIds)
			})
		};
		return save(deps, 'strategies', next);
	};

export const deleteStrategy = (deps: FramingDeps) => async (id: string, actorId: string) =>
	drop(deps, 'strategies', await existing(deps, 'strategies', id, actorId));

/** "Ça devient une epic": something to build, in the functional spec. */
export const strategyToEpic = (deps: FramingDeps) => async (id: string, actorId: string) => {
	const strategy = await existing(deps, 'strategies', id, actorId);
	if (strategy.epicId) throw conflict('Cette stratégie a déjà son epic.');
	const epic = await createEpic(deps)(
		{ id: deps.newId(), projectId: strategy.projectId, title: strategy.text.slice(0, 120) },
		actorId
	);
	await save(deps, 'strategies', { ...strategy, epicId: epic.id });
	return epic;
};

/** "Ça devient un pari": something to check before betting the project on it. */
export const strategyToHypothesis = (deps: FramingDeps) => async (id: string, actorId: string) => {
	const strategy = await existing(deps, 'strategies', id, actorId);
	if (strategy.hypothesisId) throw conflict('Cette stratégie a déjà son hypothèse.');
	const hypothesis = await deps.neighbours.createHypothesis(
		strategy.projectId,
		strategy.text.slice(0, 140),
		actorId
	);
	return save(deps, 'strategies', { ...strategy, hypothesisId: hypothesis.id });
};
