import { createBlock, deleteBlock, updateBlock } from './application/blocks';
import type { PlanningDeps } from './application/ports';
import { createSlot, createSlots, deleteSlot, HISTORY_DAYS, updateSlot } from './application/slots';

export function createPlanning(deps: PlanningDeps) {
	const since = () => new Date(deps.clock.now().getTime() - HISTORY_DAYS * 86_400_000);
	return {
		slotsOf: (userIds: string[]) => deps.slots.ofUsers(userIds, since()),
		blocksOf: (projectIds: string[]) => deps.blocks.ofProjects(projectIds, since()),
		createSlot: createSlot(deps),
		updateSlot: updateSlot(deps),
		deleteSlot: deleteSlot(deps),
		createSlots: createSlots(deps),
		createBlock: createBlock(deps),
		updateBlock: updateBlock(deps),
		deleteBlock: deleteBlock(deps)
	};
}

export type Planning = ReturnType<typeof createPlanning>;
