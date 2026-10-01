import { error, json } from '@sveltejs/kit';
import { id } from '$lib/server/commands/schemas';
import { container } from '$lib/server/container';
import { requireMember } from '$lib/server/http/guard';
import type { RequestHandler } from './$types';

/** Messages are not in the project snapshot: each thread is loaded when opened. */
export const GET: RequestHandler = async ({ params, url, locals }) => {
	await requireMember(locals, params.projectId);
	const idParam = (key: string) => {
		const value = url.searchParams.get(key) || null;
		if (value && !id.safeParse(value).success) error(400, 'Fil inconnu');
		return value;
	};
	const thread = { featureId: idParam('featureId'), channelId: idParam('channelId') };
	return json(await container.discussion.thread(params.projectId, thread));
};
