import { redirect } from '@sveltejs/kit';
import { container } from '$lib/server/container';
import { clearSessionCookie, SESSION_COOKIE } from '$lib/server/http/session-cookie';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
	const token = cookies.get(SESSION_COOKIE);
	if (token) await container.identity.closeSession(token);
	clearSessionCookie(cookies);
	redirect(303, '/login');
};
