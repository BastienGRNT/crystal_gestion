import { notFound } from '../../kernel/domain/errors';
import { validRange, type AvailabilitySlot, type AvailabilityStatus } from '../domain/availability';
import type { PlanningDeps } from './ports';

/** Exceptions older than this are history nobody plans with. */
export const HISTORY_DAYS = 60;

export interface SlotInput {
	id: string;
	startsAt: string;
	endsAt: string;
	status?: AvailabilityStatus;
}

export const createSlot = (deps: PlanningDeps) => async (input: SlotInput, userId: string) => {
	const slot: AvailabilitySlot = {
		id: input.id,
		userId,
		...validRange(input.startsAt, input.endsAt),
		status: input.status ?? 'available'
	};
	await deps.slots.insert(slot);
	deps.slotFeed.saved(slot);
	return slot;
};

/** Everyone edits their own availability only. */
async function own(deps: PlanningDeps, id: string, userId: string) {
	const slot = await deps.slots.get(id);
	if (!slot || slot.userId !== userId) throw notFound('Créneau');
	return slot;
}

export const updateSlot =
	(deps: PlanningDeps) =>
	async (id: string, patch: Partial<Omit<SlotInput, 'id'>>, userId: string) => {
		const current = await own(deps, id, userId);
		const slot: AvailabilitySlot = {
			...current,
			...validRange(patch.startsAt ?? current.startsAt, patch.endsAt ?? current.endsAt),
			status: patch.status ?? current.status
		};
		await deps.slots.save(slot);
		deps.slotFeed.saved(slot);
		return slot;
	};

export const deleteSlot = (deps: PlanningDeps) => async (id: string, userId: string) => {
	const slot = await own(deps, id, userId);
	await deps.slots.delete(id);
	deps.slotFeed.removed(slot);
};

/**
 * Several slots at once ("copier la semaine dernière"). The copy itself is computed on the
 * device: it knows the person's timezone, the server does not.
 */
export const createSlots = (deps: PlanningDeps) => async (inputs: SlotInput[], userId: string) => {
	const created: AvailabilitySlot[] = [];
	for (const input of inputs.slice(0, 60)) created.push(await createSlot(deps)(input, userId));
	return created;
};
