export type ErrorCode = 'not_found' | 'forbidden' | 'invalid' | 'conflict' | 'unauthenticated';

export class DomainError extends Error {
	constructor(
		readonly code: ErrorCode,
		message: string
	) {
		super(message);
	}
}

export const notFound = (what: string) => new DomainError('not_found', `${what} introuvable`);
export const forbidden = (why = 'Accès refusé') => new DomainError('forbidden', why);
export const invalid = (why: string) => new DomainError('invalid', why);
export const conflict = (why: string) => new DomainError('conflict', why);
