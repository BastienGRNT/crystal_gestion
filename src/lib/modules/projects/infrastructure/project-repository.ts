import { asc, eq } from 'drizzle-orm';
import type { Executor } from '$lib/server/db/types';
import type { ProjectRepository } from '../application/ports';
import type { Project } from '../domain/project';
import { projectMembers, projects } from './schema';

type Row = typeof projects.$inferSelect;

const toProject = ({ createdBy: _createdBy, createdAt, ...rest }: Row): Project => ({
	...rest,
	createdAt: createdAt.toISOString()
});

export const drizzleProjectRepository = (db: Executor): ProjectRepository => {
	const findOne = async (condition: ReturnType<typeof eq>) => {
		const [row] = await db.select().from(projects).where(condition);
		return row ? toProject(row) : null;
	};
	return {
		create: async (input) => toProject((await db.insert(projects).values(input).returning())[0]),
		update: async (id, changes) =>
			toProject((await db.update(projects).set(changes).where(eq(projects.id, id)).returning())[0]),
		findById: (id) => findOne(eq(projects.id, id)),
		findBySlug: (slug) => findOne(eq(projects.slug, slug)),
		slugExists: async (slug) => (await findOne(eq(projects.slug, slug))) !== null,
		listForUser: async (userId) => {
			const rows = await db
				.select({ project: projects })
				.from(projects)
				.innerJoin(projectMembers, eq(projectMembers.projectId, projects.id))
				.where(eq(projectMembers.userId, userId))
				.orderBy(asc(projects.name));
			return rows.map((row) => toProject(row.project));
		}
	};
};
