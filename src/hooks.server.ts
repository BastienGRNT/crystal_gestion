import { redirect, type Handle, type ServerInit } from '@sveltejs/kit';
import { container } from '$lib/server/container';
import { createConnectionHandler } from '$lib/server/realtime/connection-handler';
import { clearSessionCookie, SESSION_COOKIE } from '$lib/server/http/session-cookie';

const PUBLIC_PATHS = ['/login', '/setup', '/invite/'];

export const init: ServerInit = () => {
	(globalThis as { __crystalRealtime?: unknown }).__crystalRealtime =
		createConnectionHandler(container);
};

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get(SESSION_COOKIE);
	event.locals.user = token ? await container.identity.authenticate(token) : null;
	if (token && !event.locals.user) clearSessionCookie(event.cookies);

	const isPublic = PUBLIC_PATHS.some((path) => event.url.pathname.startsWith(path));
	if (!event.locals.user && !isPublic && !event.url.pathname.startsWith('/api')) {
		if (!(await container.identity.hasUsers())) redirect(303, '/setup');
		const back = event.url.pathname === '/' ? '' : event.url.pathname + event.url.search;
		redirect(303, back ? `/login?redirect=${encodeURIComponent(back)}` : '/login');
	}
	return resolve(event);
};
