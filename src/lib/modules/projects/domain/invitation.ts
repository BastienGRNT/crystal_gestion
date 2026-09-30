export const INVITATION_TTL_MS = 7 * 86_400_000;

export interface Invitation {
	id: string;
	projectId: string;
	expiresAt: Date;
	acceptedAt: Date | null;
}

export const isUsable = (invitation: Invitation, now: Date) =>
	!invitation.acceptedAt && invitation.expiresAt > now;
