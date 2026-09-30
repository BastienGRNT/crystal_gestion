import { and, asc, eq } from 'drizzle-orm';
import type { Executor } from '$lib/server/db/types';
import {
	deleteElement,
	insertElement,
	refColumn,
	updateElement
} from '../../elements/infrastructure/element-writer';
import { elements } from '../../elements/infrastructure/schema';
import type { FeatureRepository } from '../application/ports';
import { MOSCOW_LABELS, type Feature } from '../domain/feature';
import { features } from './schema';

const columns = {
	id: features.id,
	projectId: features.projectId,
	ref: refColumn,
	title: elements.title,
	description: features.description,
	priority: features.priority,
	ownerId: features.ownerId,
	doneCriteria: features.doneCriteria,
	createdAt: elements.createdAt
};

export const drizzleFeatureRepository = (db: Executor): FeatureRepository => {
	const select = (where: ReturnType<typeof eq>) =>
		db
			.select(columns)
			.from(features)
			.innerJoin(elements, eq(elements.id, features.id))
			.where(where);
	const toFeature = (row: Awaited<ReturnType<typeof select>>[number]): Feature => ({
		...row,
		kind: 'feature',
		createdAt: row.createdAt.toISOString()
	});
	const find = async (projectId: string, id: string) => {
		const [row] = await select(and(eq(features.projectId, projectId), eq(features.id, id))!);
		return row ? toFeature(row) : null;
	};
	return {
		find,
		list: async (projectId) =>
			(await select(eq(features.projectId, projectId)).orderBy(asc(elements.createdAt))).map(
				toFeature
			),
		create: async ({ title, createdBy, ...fields }) => {
			const id = await db.transaction(async (tx) => {
				const element = await insertElement(tx, {
					projectId: fields.projectId,
					kind: 'feature',
					title,
					createdBy,
					status: MOSCOW_LABELS[fields.priority]
				});
				await tx.insert(features).values({ id: element.id, ...fields });
				return element.id;
			});
			return (await find(fields.projectId, id))!;
		},
		update: async (projectId, id, { title, ...fields }) => {
			await db.transaction(async (tx) => {
				if (Object.keys(fields).length)
					await tx.update(features).set(fields).where(eq(features.id, id));
				const status = fields.priority ? MOSCOW_LABELS[fields.priority] : undefined;
				await updateElement(tx, id, { title, status });
			});
			return (await find(projectId, id))!;
		},
		delete: (projectId, id) => deleteElement(db, id)
	};
};
