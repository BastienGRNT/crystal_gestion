import { error, json } from '@sveltejs/kit';
import { container } from '$lib/server/container';
import { errorResponse } from '$lib/server/http/errors';
import type { RequestHandler } from './$types';

const UUID = /^[0-9a-f-]{36}$/;

export const GET: RequestHandler = async ({ params, url, locals }) => {
	if (!locals.user) error(401, 'Ta session a expiré : reconnecte-toi.');
	if (!UUID.test(params.id)) error(404, 'Canal introuvable.');
	const before = url.searchParams.get('before');
	const limit = Number(url.searchParams.get('limit') ?? 60) || 60;
	if (before && Number.isNaN(Date.parse(before))) error(400, 'Date invalide.');
	try {
		return json(await container.chat.messages(params.id, before, limit, locals.user.id));
	} catch (e) {
		return errorResponse(e);
	}
};
