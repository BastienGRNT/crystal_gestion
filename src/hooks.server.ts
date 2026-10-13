import { redirect, type Handle, type ServerInit } from '@sveltejs/kit';
import { container } from '$lib/server/container';
import { clearSessionCookie, SESSION_COOKIE } from '$lib/server/http/session-cookie';
import { createConnectionHandler } from '$lib/server/realtime/connection';

const PUBLIC_PATHS = ['/login', '/setup', '/invite/'];

export const init: ServerInit = () => {
	// realtime-attach.js (dev plugin and production server) picks the handler up from here.
	(globalThis as { __crystalRealtime?: unknown }).__crystalRealtime =
		createConnectionHandler(container);
};

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get(SESSION_COOKIE);
	event.locals.user = token ? await container.identity.authenticate(token) : null;
	if (token && !event.locals.user) clearSessionCookie(event.cookies);

	const path = event.url.pathname;
	const isPublic = PUBLIC_PATHS.some((p) => path.startsWith(p));
	if (!event.locals.user && !isPublic && !path.startsWith('/api')) {
		if (!(await container.identity.hasUsers())) redirect(303, '/setup');
		const back = path === '/' ? '' : path + event.url.search;
		redirect(303, back ? `/login?redirect=${encodeURIComponent(back)}` : '/login');
	}
	return resolve(event);
};
