import { forbidden, invalid, notFound } from '../../kernel/domain/errors';
import { canRemove, invitationExpiry, isUsable, memberId, type Member } from '../domain/membership';
import { projectAccess } from './access';
import type { ProjectDeps } from './ports';

/** A single-use link for one project. Only the token's hash is stored. */
export const createInvitation =
	(deps: ProjectDeps) => async (projectId: string, actorId: string) => {
		await projectAccess(deps.members).assertMember(projectId, actorId);
		const token = deps.tokens.generate();
		const expiresAt = invitationExpiry(deps.clock.now());
		await deps.invitations.create(deps.tokens.hash(token), {
			projectId,
			createdBy: actorId,
			expiresAt,
			usedAt: null
		});
		return { token, expiresAt: expiresAt.toISOString() };
	};

/** What the invitation page shows, or null when the link can no longer be used. */
export const inspectInvitation = (deps: ProjectDeps) => async (token: string) => {
	const invitation = await deps.invitations.find(deps.tokens.hash(token));
	if (!invitation || !isUsable(invitation, deps.clock.now())) return null;
	const project = await deps.projects.get(invitation.projectId);
	if (!project) return null;
	return {
		projectId: project.id,
		projectName: project.name,
		slug: project.slug,
		invitedBy: await deps.nameOf(invitation.createdBy)
	};
};

export const joinWithInvitation = (deps: ProjectDeps) => async (token: string, userId: string) => {
	const tokenHash = deps.tokens.hash(token);
	const invitation = await deps.invitations.find(tokenHash);
	if (!invitation || !isUsable(invitation, deps.clock.now()))
		throw invalid('Ce lien d’invitation a expiré ou a déjà servi. Demande-en un nouveau.');
	const project = await deps.projects.get(invitation.projectId);
	if (!project) throw notFound('Projet');
	if (!(await deps.members.find(project.id, userId))) {
		const member: Member = {
			id: memberId(project.id, userId),
			projectId: project.id,
			userId,
			role: 'member',
			joinedAt: deps.clock.now().toISOString()
		};
		await deps.members.add(member);
		await deps.invitations.markUsed(tokenHash, userId, deps.clock.now());
		deps.memberFeed.saved(member);
		await deps.activity.record({
			actorId: userId,
			verb: 'member.joined',
			subject: { kind: 'project', id: project.id, title: project.name, projectId: project.id }
		});
	}
	return project;
};

/** Removing yourself is leaving the project. */
export const removeMember =
	(deps: ProjectDeps) => async (projectId: string, userId: string, actorId: string) => {
		const team = await deps.members.ofProjects([projectId]);
		const actor = team.find((m) => m.userId === actorId);
		const target = team.find((m) => m.userId === userId);
		if (!actor) throw forbidden('Tu ne fais pas partie de ce projet.');
		if (!target) throw notFound('Membre');
		const refusal = canRemove(actor, target, team);
		if (refusal) throw forbidden(refusal);
		await deps.members.remove(projectId, userId);
		deps.memberFeed.removed(target);
	};
