const DAY_MS = 86_400_000;

export type Role = 'owner' | 'member';

/** Someone in a project's team. `id` is `projectId:userId`. */
export interface Member {
	id: string;
	projectId: string;
	userId: string;
	role: Role;
	joinedAt: string;
}

export const memberId = (projectId: string, userId: string) => `${projectId}:${userId}`;

export const INVITATION_DAYS = 7;

export interface Invitation {
	projectId: string;
	createdBy: string;
	expiresAt: Date;
	usedAt: Date | null;
}

export const invitationExpiry = (now: Date) => new Date(now.getTime() + INVITATION_DAYS * DAY_MS);

export const isUsable = (invitation: Invitation, now: Date) =>
	invitation.usedAt === null && invitation.expiresAt > now;

/**
 * Anyone may leave; only an owner removes someone else. A project always keeps an owner, so
 * the last one cannot leave or be removed.
 */
export function canRemove(actor: Member, target: Member, team: Member[]): string | null {
	if (actor.userId !== target.userId && actor.role !== 'owner')
		return 'Seul un responsable du projet peut retirer quelqu’un.';
	const owners = team.filter((m) => m.role === 'owner');
	if (target.role === 'owner' && owners.length === 1)
		return 'Le projet doit garder au moins un responsable.';
	return null;
}
