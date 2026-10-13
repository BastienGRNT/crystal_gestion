import { ensure, invalid, requiredText } from '../../kernel/domain/errors';

/** A shared access: a service login, or just a useful link when there is no secret. */
export interface VaultEntry {
	id: string;
	projectId: string;
	name: string;
	url: string | null;
	username: string | null;
	/** The secret itself is only sent on demand ("Afficher", "Copier"). */
	hasSecret: boolean;
	notes: string;
	createdBy: string;
	createdAt: string;
	updatedAt: string;
}

export const validEntryName = (name: string) => requiredText(name, 'Le nom', 80);

/** Accepts "stripe.com" as well as a full URL; only web links. */
export function validUrl(value: string | null): string | null {
	const text = value?.trim() ?? '';
	if (!text) return null;
	const withScheme = /^[a-z]+:\/\//i.test(text) ? text : `https://${text}`;
	let url: URL;
	try {
		url = new URL(withScheme);
	} catch {
		throw invalid('Ce lien ne semble pas valide.');
	}
	ensure(
		url.protocol === 'https:' || url.protocol === 'http:',
		'Seuls les liens web sont acceptés.'
	);
	ensure(withScheme.length <= 500, 'Le lien est trop long.');
	return url.toString();
}

function optional(value: string | null, label: string, max: number): string | null {
	const text = value?.trim() ?? '';
	ensure(text.length <= max, `${label} est trop long (${max} caractères maximum).`);
	return text || null;
}

export const validUsername = (value: string | null) => optional(value, 'L’identifiant', 200);
export const validSecret = (value: string | null) => optional(value, 'Le mot de passe', 1000);

export function validEntryNotes(value: string): string {
	ensure(value.length <= 2000, 'La note est trop longue (2000 caractères maximum).');
	return value.trim();
}

export function hostOf(url: string | null): string | null {
	if (!url) return null;
	try {
		return new URL(url).host.replace(/^www\./, '');
	} catch {
		return null;
	}
}
