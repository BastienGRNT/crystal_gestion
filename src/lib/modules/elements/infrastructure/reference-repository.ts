import { eq } from 'drizzle-orm';
import type { Executor } from '$lib/server/db/types';
import type { ReferenceRepository } from '../application/ports';
import { elementReferences } from './schema';

export const drizzleReferenceRepository = (db: Executor): ReferenceRepository => ({
	list: (projectId) =>
		db
			.select({ sourceId: elementReferences.sourceId, targetId: elementReferences.targetId })
			.from(elementReferences)
			.where(eq(elementReferences.projectId, projectId)),
	replaceForSource: (projectId, sourceId, targetIds) =>
		db.transaction(async (tx) => {
			await tx.delete(elementReferences).where(eq(elementReferences.sourceId, sourceId));
			if (targetIds.length === 0) return;
			await tx
				.insert(elementReferences)
				.values(targetIds.map((targetId) => ({ projectId, sourceId, targetId })));
		})
});
