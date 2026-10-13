import { invalid, notFound } from '../../kernel/domain/errors';
import { validRange, type WorkBlock } from '../domain/availability';
import type { PlanningDeps } from './ports';

export interface BlockInput {
	id: string;
	projectId: string;
	taskId?: string | null;
	startsAt: string;
	endsAt: string;
}

async function checkTask(deps: PlanningDeps, projectId: string, taskId: string | null | undefined) {
	if (taskId && (await deps.tasks.projectOf(taskId)) !== projectId)
		throw invalid('Cette tâche est dans un autre projet.');
}

export const createBlock = (deps: PlanningDeps) => async (input: BlockInput, userId: string) => {
	await deps.access.assertMember(input.projectId, userId);
	await checkTask(deps, input.projectId, input.taskId);
	const block: WorkBlock = {
		id: input.id,
		projectId: input.projectId,
		userId,
		taskId: input.taskId ?? null,
		...validRange(input.startsAt, input.endsAt)
	};
	await deps.blocks.insert(block);
	deps.blockFeed.saved(block);
	return block;
};

async function own(deps: PlanningDeps, id: string, userId: string) {
	const block = await deps.blocks.get(id);
	if (!block || block.userId !== userId) throw notFound('Bloc de travail');
	return block;
}

export const updateBlock =
	(deps: PlanningDeps) =>
	async (id: string, patch: Partial<Omit<BlockInput, 'id' | 'projectId'>>, userId: string) => {
		const current = await own(deps, id, userId);
		if (patch.taskId !== undefined) await checkTask(deps, current.projectId, patch.taskId);
		const block: WorkBlock = {
			...current,
			taskId: patch.taskId === undefined ? current.taskId : patch.taskId,
			...validRange(patch.startsAt ?? current.startsAt, patch.endsAt ?? current.endsAt)
		};
		await deps.blocks.save(block);
		deps.blockFeed.saved(block);
		return block;
	};

export const deleteBlock = (deps: PlanningDeps) => async (id: string, userId: string) => {
	const block = await own(deps, id, userId);
	await deps.blocks.delete(id);
	deps.blockFeed.removed(block);
};
