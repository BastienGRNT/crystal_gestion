import { json } from '@sveltejs/kit';
import { DomainError, type ErrorCode } from '$lib/modules/kernel/domain/errors';

const STATUS: Record<ErrorCode, number> = {
	invalid: 400,
	forbidden: 403,
	not_found: 404,
	conflict: 409
};

/** Turns a business refusal into a JSON answer the client shows as is; anything else is a bug. */
export function errorResponse(error: unknown): Response {
	if (error instanceof DomainError)
		return json({ message: error.message }, { status: STATUS[error.code] });
	if (isUniqueViolation(error))
		return json({ message: 'Cet élément existe déjà.' }, { status: 409 });
	throw error;
}

const isUniqueViolation = (error: unknown) =>
	typeof error === 'object' && error !== null && 'code' in error && error.code === '23505';

/** Same mapping for form actions: the message to display, or rethrow. */
export function formError(error: unknown): string {
	if (error instanceof DomainError) return error.message;
	throw error;
}
