import { error, json } from '@sveltejs/kit';
import { loadSnapshot } from '$lib/server/snapshot';
import type { RequestHandler } from './$types';

/** The data the app starts from, as plain JSON (scripts, debugging). */
export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) error(401, 'Ta session a expiré : reconnecte-toi.');
	return json(await loadSnapshot(locals.user.id));
};
