import { and, count, desc, eq, gte, inArray, sum } from 'drizzle-orm';
import type { Db } from '$lib/server/db/types';
import type { UsageRepository } from '../application/ports';
import { aiUsage } from './schema';

export const drizzleUsage = (db: Db): UsageRepository => ({
	async insert(r) {
		await db.insert(aiUsage).values({
			id: r.id,
			projectId: r.projectId,
			userId: r.userId,
			action: r.action,
			model: r.model,
			fingerprint: r.fingerprint,
			inputTokens: r.usage.input,
			outputTokens: r.usage.output,
			cacheWriteTokens: r.usage.cacheWrite,
			cacheReadTokens: r.usage.cacheRead,
			costMicros: r.costMicros,
			proposal: r.proposal,
			createdAt: new Date(r.createdAt)
		});
	},
	async since(projectIds, from) {
		if (!projectIds.length) return [];
		const rows = await db
			.select({
				projectId: aiUsage.projectId,
				requests: count(),
				micros: sum(aiUsage.costMicros)
			})
			.from(aiUsage)
			.where(and(inArray(aiUsage.projectId, projectIds), gte(aiUsage.createdAt, from)))
			.groupBy(aiUsage.projectId);
		return rows.map((r) => ({
			projectId: r.projectId,
			requests: Number(r.requests),
			micros: Number(r.micros ?? 0)
		}));
	},
	async cached(fingerprint, from) {
		const [row] = await db
			.select({ proposal: aiUsage.proposal })
			.from(aiUsage)
			.where(and(eq(aiUsage.fingerprint, fingerprint), gte(aiUsage.createdAt, from)))
			.orderBy(desc(aiUsage.createdAt))
			.limit(1);
		return row?.proposal ?? null;
	}
});
