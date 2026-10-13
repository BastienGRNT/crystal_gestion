import { asc, eq } from 'drizzle-orm';
import { iso, isoOrNull } from '$lib/server/db/columns';
import type { Db } from '$lib/server/db/types';
import type { Project } from '../domain/project';
import type { ProjectRepository } from '../application/ports';
import { projects } from './schema';

const toProject = (row: typeof projects.$inferSelect): Project => ({
	...row,
	archivedAt: isoOrNull(row.archivedAt),
	createdAt: iso(row.createdAt)
});

const toRow = (project: Project) => ({
	...project,
	archivedAt: project.archivedAt ? new Date(project.archivedAt) : null,
	createdAt: new Date(project.createdAt)
});

export const drizzleProjects = (db: Db): ProjectRepository => ({
	list: async () =>
		(await db.select().from(projects).orderBy(asc(projects.createdAt))).map(toProject),
	async get(id) {
		const [row] = await db.select().from(projects).where(eq(projects.id, id));
		return row ? toProject(row) : null;
	},
	async insert(project) {
		await db.insert(projects).values(toRow(project));
	},
	async save(project) {
		await db.update(projects).set(toRow(project)).where(eq(projects.id, project.id));
	}
});
