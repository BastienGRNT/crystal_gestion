import { error, json } from '@sveltejs/kit';
import { id } from '$lib/server/commands/schemas';
import { container } from '$lib/server/container';
import { requireMember } from '$lib/server/http/guard';
import type { RequestHandler } from './$types';

/** Messages are not in the project snapshot: each thread is loaded when opened. */
export const GET: RequestHandler = async ({ params, url, locals }) => {
	await requireMember(locals, params.projectId);
	const featureId = url.searchParams.get('featureId') || null;
	if (featureId && !id.safeParse(featureId).success) error(400, 'Fil inconnu');
	return json(await container.discussion.thread(params.projectId, featureId));
};
