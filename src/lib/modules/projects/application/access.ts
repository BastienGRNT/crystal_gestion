import type { Access } from '../../kernel/application/ports';
import { forbidden } from '../../kernel/domain/errors';
import type { MemberRepository } from './ports';

/** Membership checks every other module relies on. */
export const projectAccess = (members: MemberRepository): Access => {
	const isMember = async (projectId: string, userId: string) =>
		(await members.find(projectId, userId)) !== null;
	return {
		isMember,
		async assertMember(projectId, userId) {
			if (!(await isMember(projectId, userId)))
				throw forbidden('Tu ne fais pas partie de ce projet.');
		},
		members: async (projectId) => (await members.ofProjects([projectId])).map((m) => m.userId)
	};
};
