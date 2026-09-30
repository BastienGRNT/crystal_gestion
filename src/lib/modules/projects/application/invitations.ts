import type { Clock } from '$lib/modules/kernel/application/ports';
import type { TokenService } from '$lib/modules/identity/application/ports';
import { notFound } from '$lib/modules/kernel/domain/errors';
import { INVITATION_TTL_MS, isUsable } from '../domain/invitation';
import type { InvitationRepository, ProjectRepository } from './ports';

interface Deps {
	invitations: InvitationRepository;
	projects: ProjectRepository;
	tokens: TokenService;
	clock: Clock;
}

export const makeCreateInvitation =
	(deps: Deps) => async (projectId: string, invitedBy: string) => {
		const token = deps.tokens.generate();
		const expiresAt = new Date(deps.clock.now().getTime() + INVITATION_TTL_MS);
		await deps.invitations.create({
			projectId,
			invitedBy,
			expiresAt,
			tokenHash: deps.tokens.hash(token)
		});
		return { token, expiresAt: expiresAt.toISOString() };
	};

export const makeFindInvitation = (deps: Deps) => async (token: string) => {
	const invitation = await deps.invitations.findByTokenHash(deps.tokens.hash(token));
	if (!invitation || !isUsable(invitation, deps.clock.now())) throw notFound('Invitation');
	const project = await deps.projects.findById(invitation.projectId);
	if (!project) throw notFound('Projet');
	return { invitation, project };
};
