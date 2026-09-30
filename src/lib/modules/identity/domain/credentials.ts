import { invalid } from '$lib/modules/kernel/domain/errors';

export const MIN_PASSWORD_LENGTH = 8;

export function assertValidPassword(password: string): void {
	if (password.length < MIN_PASSWORD_LENGTH)
		throw invalid(`Le mot de passe doit faire au moins ${MIN_PASSWORD_LENGTH} caractères`);
}

export function assertValidName(name: string): void {
	if (!name.trim()) throw invalid('Le nom est requis');
}
