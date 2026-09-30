import { fail, redirect, type Cookies } from '@sveltejs/kit';
import { DomainError } from '$lib/modules/kernel/domain/errors';
import { container } from '../container';
import { setSessionCookie } from './session-cookie';

export const field = (data: FormData, name: string) => String(data.get(name) ?? '');

export async function signIn(cookies: Cookies, userId: string) {
	const session = await container.identity.openSession(userId);
	setSessionCookie(cookies, session.token, session.expiresAt);
}

/** Runs an auth form step, turning domain errors into form feedback and success into a redirect. */
export async function authStep(run: () => Promise<string>, values: Record<string, string> = {}) {
	let target: string;
	try {
		target = await run();
	} catch (cause) {
		if (cause instanceof DomainError) return fail(400, { error: cause.message, ...values });
		throw cause;
	}
	redirect(303, target);
}

export const safeRedirect = (target: string | null) =>
	target?.startsWith('/') && !target.startsWith('//') ? target : '/';
