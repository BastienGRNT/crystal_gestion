import type { ChangeFeed } from '$lib/modules/kernel/application/ports';
import type { Actor } from '$lib/modules/kernel/domain/actor';
import { invalid, notFound } from '$lib/modules/kernel/domain/errors';
import type { Availability } from '../domain/availability';
import type { AvailabilityChanges, AvailabilityRepository, UserProjects } from './ports';

interface Deps {
	availabilities: AvailabilityRepository;
	projects: UserProjects;
	feed: ChangeFeed;
}

const assertRange = ({ startsAt, endsAt }: Pick<Availability, 'startsAt' | 'endsAt'>) => {
	if (endsAt <= startsAt) throw invalid('La fin doit être après le début');
};

/** Availability is personal: it is broadcast to every project of its owner. */
export function makeAvailabilityUseCases(deps: Deps) {
	const broadcast = async (userId: string, publish: (projectId: string) => void) =>
		(await deps.projects.projectIdsOf(userId)).forEach(publish);
	const findOwned = async (actor: Actor, id: string) => {
		const slot = await deps.availabilities.findOwned(id, actor.id);
		if (!slot) throw notFound('Disponibilité');
		return slot;
	};
	return {
		create: async (actor: Actor, input: Omit<Availability, 'id' | 'userId'>) => {
			assertRange(input);
			const slot = await deps.availabilities.create({ ...input, userId: actor.id });
			await broadcast(actor.id, (projectId) => deps.feed.upserted('availability', projectId, slot));
			return slot;
		},
		update: async (actor: Actor, { id, changes }: { id: string; changes: AvailabilityChanges }) => {
			assertRange({ ...(await findOwned(actor, id)), ...changes });
			const slot = await deps.availabilities.update(id, changes);
			await broadcast(actor.id, (projectId) => deps.feed.upserted('availability', projectId, slot));
			return slot;
		},
		remove: async (actor: Actor, { id }: { id: string }) => {
			await findOwned(actor, id);
			await deps.availabilities.delete(id);
			await broadcast(actor.id, (projectId) => deps.feed.deleted('availability', projectId, id));
		},
		listForProject: (projectId: string) => deps.availabilities.listForProject(projectId)
	};
}

export type PlanningModule = ReturnType<typeof makeAvailabilityUseCases>;
