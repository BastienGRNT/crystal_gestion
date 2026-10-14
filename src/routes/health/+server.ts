import type { RequestHandler } from './$types';

/** Liveness probe for the container healthcheck: no session, no database. */
export const GET: RequestHandler = () =>
	new Response('ok', { headers: { 'cache-control': 'no-store' } });
