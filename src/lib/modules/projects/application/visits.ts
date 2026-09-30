import type { Clock } from '$lib/modules/kernel/application/ports';
import { registerVisit } from '../domain/visit';
import type { MemberRepository } from './ports';

/** Returns the moment from which the "since your last visit" recap starts. */
export const makeRecordVisit =
	(deps: { members: MemberRepository; clock: Clock }) =>
	async (projectId: string, userId: string) => {
		const state = registerVisit(await deps.members.visitState(projectId, userId), deps.clock.now());
		await deps.members.saveVisitState(projectId, userId, state);
		return state.recapSince;
	};
