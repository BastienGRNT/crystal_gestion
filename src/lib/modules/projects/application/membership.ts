import type { ChangeFeed } from '$lib/modules/kernel/application/ports';
import { forbidden } from '$lib/modules/kernel/domain/errors';
import type { MemberRepository } from './ports';

export const makeAssertMember =
	(deps: { members: MemberRepository }) => async (projectId: string, userId: string) => {
		if (!(await deps.members.isMember(projectId, userId)))
			throw forbidden('Tu ne fais pas partie de ce projet');
	};

export const makeAddMember =
	(deps: { members: MemberRepository; feed: ChangeFeed }) =>
	async (projectId: string, userId: string) => {
		if (await deps.members.isMember(projectId, userId)) return;
		const member = await deps.members.add(projectId, userId, 'member');
		deps.feed.upserted('member', projectId, member);
	};
