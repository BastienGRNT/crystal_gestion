import { and, eq, isNull } from 'drizzle-orm';
import { isoOrNull, type Executor } from '$lib/server/db/types';
import type { QuestionRepository } from '../application/ports';
import { questionId, type Question } from '../domain/message';
import { questionTargets } from './schema';

const toQuestion = (row: typeof questionTargets.$inferSelect): Question => ({
	...row,
	id: questionId(row.messageId, row.userId),
	resolvedAt: isoOrNull(row.resolvedAt)
});

export const drizzleQuestionRepository = (db: Executor): QuestionRepository => ({
	open: async (projectId, messageId, userIds) => {
		if (!userIds.length) return [];
		const rows = await db
			.insert(questionTargets)
			.values(userIds.map((userId) => ({ projectId, messageId, userId })))
			.onConflictDoNothing()
			.returning();
		return rows.map(toQuestion);
	},
	close: async (messageId) =>
		(
			await db.delete(questionTargets).where(eq(questionTargets.messageId, messageId)).returning()
		).map((row) => questionId(row.messageId, row.userId)),
	resolve: async (messageId, userId, at) => {
		const [row] = await db
			.update(questionTargets)
			.set({ resolvedAt: at })
			.where(
				and(
					eq(questionTargets.messageId, messageId),
					eq(questionTargets.userId, userId),
					isNull(questionTargets.resolvedAt)
				)
			)
			.returning();
		return row ? toQuestion(row) : null;
	},
	listOpen: async (projectId) =>
		(
			await db
				.select()
				.from(questionTargets)
				.where(and(eq(questionTargets.projectId, projectId), isNull(questionTargets.resolvedAt)))
		).map(toQuestion)
});
