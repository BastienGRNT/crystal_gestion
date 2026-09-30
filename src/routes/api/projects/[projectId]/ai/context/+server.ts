import { json } from '@sveltejs/kit';
import { container } from '$lib/server/container';
import { requireMember } from '$lib/server/http/guard';
import type { RequestHandler } from './$types';

/** The structured project context future AI features will receive; exposed for inspection. */
export const GET: RequestHandler = async ({ params, locals }) => {
	await requireMember(locals, params.projectId);
	return json(await container.ai.context(params.projectId));
};
