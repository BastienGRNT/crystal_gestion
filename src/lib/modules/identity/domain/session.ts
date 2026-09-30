const DAY_MS = 86_400_000;
export const SESSION_DURATION_MS = 30 * DAY_MS;
const RENEW_THRESHOLD_MS = 15 * DAY_MS;

export interface Session {
	userId: string;
	expiresAt: Date;
}

export const isExpired = (session: Session, now: Date) => session.expiresAt <= now;

export const needsRenewal = (session: Session, now: Date) =>
	session.expiresAt.getTime() - now.getTime() < RENEW_THRESHOLD_MS;

export const expiryFrom = (now: Date) => new Date(now.getTime() + SESSION_DURATION_MS);
