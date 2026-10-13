export type ErrorCode = 'invalid' | 'not_found' | 'forbidden' | 'conflict';

/** A business rule refusal. Its message is written for the person using the app (French). */
export class DomainError extends Error {
	constructor(
		readonly code: ErrorCode,
		message: string
	) {
		super(message);
		this.name = 'DomainError';
	}
}

export const invalid = (message: string) => new DomainError('invalid', message);
export const notFound = (what: string) => new DomainError('not_found', `${what} introuvable.`);
export const forbidden = (message = 'Tu ne peux pas faire ça.') =>
	new DomainError('forbidden', message);
export const conflict = (message: string) => new DomainError('conflict', message);

export function ensure(condition: unknown, message: string): asserts condition {
	if (!condition) throw invalid(message);
}

/** Trims a required text and enforces its length, with a message naming the field. */
export function requiredText(value: string, label: string, max: number): string {
	const text = value.trim();
	ensure(text.length > 0, `${label} ne peut pas être vide.`);
	ensure(text.length <= max, `${label} est trop long (${max} caractères maximum).`);
	return text;
}
