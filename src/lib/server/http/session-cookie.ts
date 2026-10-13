import type { Cookies } from '@sveltejs/kit';
import { SESSION_DAYS } from '$lib/modules/identity/domain/session';

export const SESSION_COOKIE = 'crystal_session';

export function setSessionCookie(cookies: Cookies, token: string, url: URL) {
	cookies.set(SESSION_COOKIE, token, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: url.protocol === 'https:',
		maxAge: SESSION_DAYS * 86_400
	});
}

export const clearSessionCookie = (cookies: Cookies) =>
	cookies.delete(SESSION_COOKIE, { path: '/' });
