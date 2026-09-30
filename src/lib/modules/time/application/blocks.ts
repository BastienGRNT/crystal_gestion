import type { ChangeFeed, Clock } from '$lib/modules/kernel/application/ports';
import type { Actor } from '$lib/modules/kernel/domain/actor';
import { notFound } from '$lib/modules/kernel/domain/errors';
import { assertValidRange } from '../domain/time-entry';
import type { TimeEntryChanges, TimeEntryRepository } from './ports';

interface Deps {
	entries: TimeEntryRepository;
	feed: ChangeFeed;
	clock: Clock;
}

type Block = { projectId: string; startedAt: string; endedAt: string; taskId: string | null };

export const makeCreateBlock = (deps: Deps) => async (actor: Actor, block: Block) => {
	assertValidRange(block.startedAt, block.endedAt);
	const entry = await deps.entries.create({ ...block, userId: actor.id, source: 'manual' });
	deps.feed.upserted('timeEntry', entry.projectId, entry);
	return entry;
};

/** Manual time on a task: a block ending now. */
export const makeLogTime =
	(deps: Deps) => (actor: Actor, input: { projectId: string; taskId: string; minutes: number }) => {
		const endedAt = deps.clock.now();
		const startedAt = new Date(endedAt.getTime() - input.minutes * 60_000);
		const block = {
			projectId: input.projectId,
			taskId: input.taskId,
			startedAt: startedAt.toISOString(),
			endedAt: endedAt.toISOString()
		};
		return makeCreateBlock(deps)(actor, block);
	};

export const makeUpdateBlock =
	(deps: Deps) =>
	async (actor: Actor, { id, changes }: { id: string; changes: TimeEntryChanges }) => {
		const entry = await deps.entries.findOwned(id, actor.id);
		if (!entry) throw notFound('Bloc de travail');
		const next = { ...entry, ...changes };
		if (next.endedAt) assertValidRange(next.startedAt, next.endedAt);
		const updated = await deps.entries.update(id, changes);
		deps.feed.upserted('timeEntry', updated.projectId, updated);
		return updated;
	};

export const makeDeleteBlock =
	(deps: Deps) =>
	async (actor: Actor, { id }: { id: string }) => {
		const entry = await deps.entries.findOwned(id, actor.id);
		if (!entry) throw notFound('Bloc de travail');
		await deps.entries.delete(id);
		deps.feed.deleted('timeEntry', entry.projectId, id);
	};
