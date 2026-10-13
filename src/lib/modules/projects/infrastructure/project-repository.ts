import { and, asc, eq, inArray } from 'drizzle-orm';
import { iso, isoOrNull } from '$lib/server/db/columns';
import type { Db } from '$lib/server/db/types';
import { memberId, type Member } from '../domain/membership';
import type { Project } from '../domain/project';
import type {
	InvitationRepository,
	MemberRepository,
	ProjectRepository
} from '../application/ports';
import { projectInvitations, projectMembers, projects } from './schema';

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

const toMember = (row: typeof projectMembers.$inferSelect): Member => ({
	...row,
	id: memberId(row.projectId, row.userId),
	joinedAt: iso(row.joinedAt)
});

export const drizzleProjects = (db: Db): ProjectRepository => ({
	listByIds: async (ids) =>
		ids.length
			? (
					await db
						.select()
						.from(projects)
						.where(inArray(projects.id, ids))
						.orderBy(asc(projects.createdAt))
				).map(toProject)
			: [],
	async get(id) {
		const [row] = await db.select().from(projects).where(eq(projects.id, id));
		return row ? toProject(row) : null;
	},
	slugs: async () => (await db.select({ slug: projects.slug }).from(projects)).map((r) => r.slug),
	async insert(project) {
		await db.insert(projects).values(toRow(project));
	},
	async save(project) {
		await db.update(projects).set(toRow(project)).where(eq(projects.id, project.id));
	}
});

export const drizzleMembers = (db: Db): MemberRepository => ({
	ofProjects: async (ids) =>
		ids.length
			? (
					await db
						.select()
						.from(projectMembers)
						.where(inArray(projectMembers.projectId, ids))
						.orderBy(asc(projectMembers.joinedAt))
				).map(toMember)
			: [],
	projectIdsOf: async (userId) =>
		(
			await db
				.select({ id: projectMembers.projectId })
				.from(projectMembers)
				.where(eq(projectMembers.userId, userId))
		).map((r) => r.id),
	async find(projectId, userId) {
		const [row] = await db
			.select()
			.from(projectMembers)
			.where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)));
		return row ? toMember(row) : null;
	},
	async add(member) {
		await db.insert(projectMembers).values({
			projectId: member.projectId,
			userId: member.userId,
			role: member.role,
			joinedAt: new Date(member.joinedAt)
		});
	},
	async remove(projectId, userId) {
		await db
			.delete(projectMembers)
			.where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)));
	}
});

export const drizzleInvitations = (db: Db): InvitationRepository => ({
	async create(tokenHash, invitation) {
		await db.insert(projectInvitations).values({ tokenHash, ...invitation });
	},
	async find(tokenHash) {
		const [row] = await db
			.select()
			.from(projectInvitations)
			.where(eq(projectInvitations.tokenHash, tokenHash));
		return row
			? {
					projectId: row.projectId,
					createdBy: row.createdBy,
					expiresAt: row.expiresAt,
					usedAt: row.usedAt
				}
			: null;
	},
	async markUsed(tokenHash, usedBy, usedAt) {
		await db
			.update(projectInvitations)
			.set({ usedAt, usedBy })
			.where(eq(projectInvitations.tokenHash, tokenHash));
	}
});
