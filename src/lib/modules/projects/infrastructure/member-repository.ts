import { and, asc, eq } from 'drizzle-orm';
import type { Executor } from '$lib/server/db/types';
import { users } from '../../identity/infrastructure/schema';
import type { MemberRepository } from '../application/ports';
import { projectMembers } from './schema';

const memberColumns = {
	id: users.id,
	name: users.name,
	email: users.email,
	color: users.color,
	role: projectMembers.role
};

export const drizzleMemberRepository = (db: Executor): MemberRepository => {
	const membership = (projectId: string, userId: string) =>
		and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId));
	const selectMembers = () =>
		db
			.select(memberColumns)
			.from(projectMembers)
			.innerJoin(users, eq(users.id, projectMembers.userId));
	return {
		add: async (projectId, userId, role) => {
			await db.insert(projectMembers).values({ projectId, userId, role });
			return (await selectMembers().where(membership(projectId, userId)))[0];
		},
		list: (projectId) =>
			selectMembers().where(eq(projectMembers.projectId, projectId)).orderBy(asc(users.name)),
		isMember: async (projectId, userId) =>
			(await db.select().from(projectMembers).where(membership(projectId, userId))).length > 0,
		visitState: async (projectId, userId) => {
			const [row] = await db.select().from(projectMembers).where(membership(projectId, userId));
			return { lastSeenAt: row?.lastSeenAt ?? null, recapSince: row?.recapSince ?? null };
		},
		saveVisitState: async (projectId, userId, state) => {
			await db.update(projectMembers).set(state).where(membership(projectId, userId));
		}
	};
};
