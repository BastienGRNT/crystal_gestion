import { error, type NumericRange } from '@sveltejs/kit';
import { z } from 'zod';
import { DomainError, type ErrorCode } from '$lib/modules/kernel/domain/errors';

const STATUS: Record<ErrorCode, NumericRange<400, 599>> = {
	invalid: 400,
	unauthenticated: 401,
	forbidden: 403,
	not_found: 404,
	conflict: 409
};

/** Translates domain and validation failures into HTTP errors; anything else stays a 500. */
export function toHttpError(cause: unknown): never {
	if (cause instanceof DomainError) error(STATUS[cause.code], cause.message);
	if (cause instanceof z.ZodError) error(400, z.prettifyError(cause));
	throw cause;
}
