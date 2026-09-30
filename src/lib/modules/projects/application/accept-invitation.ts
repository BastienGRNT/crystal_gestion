import type { Clock } from '$lib/modules/kernel/application/ports';
import type { Invitation } from '../domain/invitation';
import type { Project } from '../domain/project';
import type { InvitationRepository } from './ports';

interface Deps {
	findInvitation: (token: string) => Promise<{ invitation: Invitation; project: Project }>;
	addMember: (projectId: string, userId: string) => Promise<void>;
	invitations: InvitationRepository;
	clock: Clock;
}

/** `resolveUser` creates or authenticates the account only once the invitation is known to be valid. */
export const makeAcceptInvitation =
	(deps: Deps) => async (token: string, resolveUser: () => Promise<{ id: string }>) => {
		const { invitation, project } = await deps.findInvitation(token);
		const user = await resolveUser();
		await deps.addMember(project.id, user.id);
		await deps.invitations.markAccepted(invitation.id, user.id, deps.clock.now());
		return { user, project };
	};
