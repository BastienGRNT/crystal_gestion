import { invalid, notFound } from '../../kernel/domain/errors';
import type { FramingDeps, FramingStores, ItemOf } from './ports';

export type Kind = keyof FramingStores;

const LABELS: Record<Kind, string> = {
	initiatives: 'Initiative',
	epics: 'Epic',
	stories: 'Story',
	stakeholders: 'Partie prenante',
	journeys: 'Parcours',
	terms: 'Terme',
	swot: 'Élément du SWOT',
	strategies: 'Stratégie'
};

/** An item the actor may touch: it exists and they are on its project. */
export async function existing<K extends Kind>(
	deps: FramingDeps,
	kind: K,
	id: string,
	actorId: string
): Promise<ItemOf<K>> {
	const item = (await deps.stores[kind].get(id)) as ItemOf<K> | null;
	if (!item) throw notFound(LABELS[kind]);
	await deps.access.assertMember(item.projectId, actorId);
	return item;
}

export async function save<K extends Kind>(deps: FramingDeps, kind: K, item: ItemOf<K>) {
	await (deps.stores[kind].put as (i: ItemOf<K>) => Promise<void>)(item);
	(deps.feeds[kind].saved as (i: ItemOf<K>) => void)(item);
	return item;
}

export async function drop<K extends Kind>(deps: FramingDeps, kind: K, item: ItemOf<K>) {
	await deps.stores[kind].delete(item.id);
	(deps.feeds[kind].removed as (i: ItemOf<K>) => void)(item);
}

/** A link to another framing item only holds inside the same project. */
export async function inProject(
	deps: FramingDeps,
	kind: Kind,
	id: string | null | undefined,
	projectId: string
) {
	if (!id) return;
	const item = await deps.stores[kind].get(id);
	if (!item || item.projectId !== projectId) throw invalid(`${LABELS[kind]} inconnu(e).`);
}

/** Same rule for the metrics, bets and modules of the other modules. */
export async function neighbourInProject(
	deps: FramingDeps,
	kind: 'metric' | 'hypothesis' | 'component',
	id: string | null | undefined,
	projectId: string
) {
	if (!id) return;
	if ((await deps.neighbours.projectOf(kind, id)) !== projectId)
		throw invalid(
			{
				metric: 'Chiffre inconnu.',
				hypothesis: 'Hypothèse inconnue.',
				component: 'Module inconnu.'
			}[kind]
		);
}

/** New items go at the end. */
export async function nextPosition(deps: FramingDeps, kind: Kind, projectId: string) {
	const items = (await deps.stores[kind].ofProject(projectId)) as { position?: number }[];
	return Math.max(0, ...items.map((i) => i.position ?? 0)) + 1;
}

/** Keeps the fields an update sent, and only those. */
export const defined = <T extends object>(patch: T): Partial<T> =>
	Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined)) as Partial<T>;
