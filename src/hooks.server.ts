import { redirect, type Handle, type ServerInit } from '@sveltejs/kit';
import { container } from '$lib/server/container';
import { clearSessionCookie, SESSION_COOKIE } from '$lib/server/http/session-cookie';
import { createConnectionHandler } from '$lib/server/realtime/connection';

const PUBLIC_PATHS = ['/login', '/inscription', '/invite/', '/health'];

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
		const entry = (await container.identity.hasUsers()) ? '/login' : '/inscription';
		const back = path === '/' ? '' : path + event.url.search;
		redirect(303, back ? `${entry}?redirect=${encodeURIComponent(back)}` : entry);
	}
	return withoutPreloadHeader(await resolve(event));
};

/**
 * SvelteKit lists every preloaded chunk in a `Link` header (≈ 4 KB on project pages). Past
 * Nginx's default 4 KB header buffer, the proxy answers 502. The <head> already has them.
 */
function withoutPreloadHeader(response: Response) {
	if (response.headers.get('content-type')?.startsWith('text/html'))
		response.headers.delete('link');
	return response;
}
