const DAY_MS = 86_400_000;

export const SESSION_DAYS = 30;
export const INVITATION_DAYS = 7;

export const sessionExpiry = (now: Date) => new Date(now.getTime() + SESSION_DAYS * DAY_MS);

/** Sliding sessions: renewed once half of their life is gone, so active people never get logged out. */
export const shouldRenew = (expiresAt: Date, now: Date) =>
	expiresAt.getTime() - now.getTime() < (SESSION_DAYS / 2) * DAY_MS;

export const invitationExpiry = (now: Date) => new Date(now.getTime() + INVITATION_DAYS * DAY_MS);

export interface Invitation {
	createdBy: string;
	expiresAt: Date;
	usedAt: Date | null;
}

export const isUsable = (invitation: Invitation, now: Date) =>
	invitation.usedAt === null && invitation.expiresAt > now;
