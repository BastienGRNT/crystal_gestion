import { ensure, requiredText } from '../../kernel/domain/errors';

/** What someone says about their availability right now, on top of being online or not. */
export const WORK_STATUSES = ['available', 'focus', 'away'] as const;
export type WorkStatus = (typeof WORK_STATUSES)[number];

export interface User {
	id: string;
	email: string;
	name: string;
	/** Index in the 8 tints of the theme, for the avatar. */
	color: number;
	status: WorkStatus;
	statusNote: string | null;
	lastSeenAt: string | null;
	createdAt: string;
}

export const USER_COLORS = 8;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validEmail(value: string): string {
	const email = value.trim().toLowerCase();
	ensure(EMAIL.test(email), 'Cette adresse email ne semble pas valide.');
	return email;
}

export const validName = (value: string) => requiredText(value, 'Le nom', 60);

export function validPassword(value: string): string {
	ensure(value.length >= 8, 'Le mot de passe doit faire au moins 8 caractères.');
	ensure(value.length <= 200, 'Le mot de passe est trop long.');
	return value;
}

export function validColor(value: number): number {
	ensure(Number.isInteger(value) && value >= 0 && value < USER_COLORS, 'Couleur inconnue.');
	return value;
}

export function validStatusNote(value: string | null): string | null {
	const note = value?.trim() ?? '';
	ensure(note.length <= 80, 'Le message de statut est trop long (80 caractères maximum).');
	return note || null;
}

/** Spreads colors across the team so two people rarely share one. */
export const nextColor = (taken: number[]) =>
	Array.from({ length: USER_COLORS }, (_, i) => i).find((c) => !taken.includes(c)) ??
	taken.length % USER_COLORS;
