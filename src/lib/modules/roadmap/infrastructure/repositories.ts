import { asc, eq, inArray } from 'drizzle-orm';
import { iso, isoOrNull } from '$lib/server/db/columns';
import type { Db } from '$lib/server/db/types';
import type { Store } from '../application/ports';
import type { Decision } from '../domain/decision';
import type { Hypothesis } from '../domain/hypothesis';
import type { MetricReading } from '../domain/metric';
import type { Milestone } from '../domain/milestone';
import { decisions, hypotheses, metricReadings, milestones } from './schema';

const date = (value: string | null) => (value ? new Date(value) : null);

export const drizzleMilestones = (db: Db): Store<Milestone> => {
	const toItem = (row: typeof milestones.$inferSelect): Milestone => ({
		...row,
		closedAt: isoOrNull(row.closedAt),
		createdAt: iso(row.createdAt)
	});
	const toRow = (m: Milestone) => ({
		...m,
		closedAt: date(m.closedAt),
		createdAt: new Date(m.createdAt)
	});
	return {
		ofProjects: async (ids) =>
			ids.length
				? (await db.select().from(milestones).where(inArray(milestones.projectId, ids))).map(toItem)
				: [],
		ofProject: async (id) =>
			(await db.select().from(milestones).where(eq(milestones.projectId, id))).map(toItem),
		async get(id) {
			const [row] = await db.select().from(milestones).where(eq(milestones.id, id));
			return row ? toItem(row) : null;
		},
		async put(m) {
			const row = toRow(m);
			await db
				.insert(milestones)
				.values(row)
				.onConflictDoUpdate({ target: milestones.id, set: row });
		},
		async delete(id) {
			await db.delete(milestones).where(eq(milestones.id, id));
		}
	};
};

export const drizzleDecisions = (db: Db): Store<Decision> => {
	const toItem = (row: typeof decisions.$inferSelect): Decision => ({
		...row,
		decidedAt: iso(row.decidedAt)
	});
	const toRow = (d: Decision) => ({ ...d, decidedAt: new Date(d.decidedAt) });
	const select = () => db.select().from(decisions).orderBy(asc(decisions.decidedAt));
	return {
		ofProjects: async (ids) =>
			ids.length ? (await select().where(inArray(decisions.projectId, ids))).map(toItem) : [],
		ofProject: async (id) => (await select().where(eq(decisions.projectId, id))).map(toItem),
		async get(id) {
			const [row] = await db.select().from(decisions).where(eq(decisions.id, id));
			return row ? toItem(row) : null;
		},
		async put(d) {
			const row = toRow(d);
			await db.insert(decisions).values(row).onConflictDoUpdate({ target: decisions.id, set: row });
		},
		async delete(id) {
			await db.delete(decisions).where(eq(decisions.id, id));
		}
	};
};

export const drizzleHypotheses = (db: Db): Store<Hypothesis> => {
	const toItem = (row: typeof hypotheses.$inferSelect): Hypothesis => ({
		...row,
		createdAt: iso(row.createdAt)
	});
	const toRow = (h: Hypothesis) => ({ ...h, createdAt: new Date(h.createdAt) });
	return {
		ofProjects: async (ids) =>
			ids.length
				? (await db.select().from(hypotheses).where(inArray(hypotheses.projectId, ids))).map(toItem)
				: [],
		ofProject: async (id) =>
			(await db.select().from(hypotheses).where(eq(hypotheses.projectId, id))).map(toItem),
		async get(id) {
			const [row] = await db.select().from(hypotheses).where(eq(hypotheses.id, id));
			return row ? toItem(row) : null;
		},
		async put(h) {
			const row = toRow(h);
			await db
				.insert(hypotheses)
				.values(row)
				.onConflictDoUpdate({ target: hypotheses.id, set: row });
		},
		async delete(id) {
			await db.delete(hypotheses).where(eq(hypotheses.id, id));
		}
	};
};

export const drizzleReadings = (db: Db): Store<MetricReading> => {
	const toItem = (row: typeof metricReadings.$inferSelect): MetricReading => ({
		...row,
		at: iso(row.at)
	});
	const toRow = (r: MetricReading) => ({ ...r, at: new Date(r.at) });
	return {
		ofProjects: async (ids) =>
			ids.length
				? (
						await db.select().from(metricReadings).where(inArray(metricReadings.projectId, ids))
					).map(toItem)
				: [],
		ofProject: async (id) =>
			(await db.select().from(metricReadings).where(eq(metricReadings.projectId, id))).map(toItem),
		async get(id) {
			const [row] = await db.select().from(metricReadings).where(eq(metricReadings.id, id));
			return row ? toItem(row) : null;
		},
		async put(r) {
			const row = toRow(r);
			await db
				.insert(metricReadings)
				.values(row)
				.onConflictDoUpdate({ target: metricReadings.id, set: row });
		},
		async delete(id) {
			await db.delete(metricReadings).where(eq(metricReadings.id, id));
		}
	};
};
