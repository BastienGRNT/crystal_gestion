import type { Actor } from '../domain/actor';
import type { ElementBase } from '../domain/element';
import { notFound } from '../domain/errors';
import type { EntityName } from '../domain/realtime';
import type { ActivityLog, ChangeFeed, ReferenceSync } from './ports';

type Element = ElementBase & { projectId: string };

export interface ElementStore<T extends Element, Fields> {
	create(input: Partial<Fields> & { projectId: string; createdBy: string }): Promise<T>;
	update(projectId: string, id: string, changes: Partial<Fields>): Promise<T>;
	find(projectId: string, id: string): Promise<T | null>;
	delete(projectId: string, id: string): Promise<void>;
	list(projectId: string): Promise<T[]>;
}

interface Deps<T extends Element, Fields> {
	entity: EntityName;
	store: ElementStore<T, Fields>;
	feed: ChangeFeed;
	activity: ActivityLog;
	references: ReferenceSync;
	textsOf: (element: T) => string[];
}

export type Target = { projectId: string; id: string };

/** Standard lifecycle of a simple element: persist, broadcast, index references, log activity. */
export function makeElementCrud<T extends Element, Fields>(deps: Deps<T, Fields>) {
	const announce = async (actor: Actor, element: T, verb: 'created' | 'updated') => {
		deps.feed.upserted(deps.entity, element.projectId, element);
		await deps.references.sync(element.projectId, element.id, deps.textsOf(element));
		await deps.activity.record({ projectId: element.projectId, actor, verb, element });
		return element;
	};
	const findOrFail = async ({ projectId, id }: Target) => {
		const element = await deps.store.find(projectId, id);
		if (!element) throw notFound('Élément');
		return element;
	};
	return {
		create: async (actor: Actor, input: Partial<Fields> & { projectId: string }) =>
			announce(actor, await deps.store.create({ ...input, createdBy: actor.id }), 'created'),
		update: async (actor: Actor, { changes, ...target }: Target & { changes: Partial<Fields> }) => {
			await findOrFail(target);
			return announce(
				actor,
				await deps.store.update(target.projectId, target.id, changes),
				'updated'
			);
		},
		remove: async (actor: Actor, target: Target) => {
			const element = await findOrFail(target);
			await deps.store.delete(target.projectId, target.id);
			deps.feed.deleted(deps.entity, target.projectId, target.id);
			await deps.activity.record({ projectId: target.projectId, actor, verb: 'deleted', element });
			return element;
		},
		find: findOrFail,
		list: (projectId: string) => deps.store.list(projectId)
	};
}

export type ElementCrud<T extends Element, Fields> = ReturnType<typeof makeElementCrud<T, Fields>>;
