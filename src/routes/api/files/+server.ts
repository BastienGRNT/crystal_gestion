import { error, json } from '@sveltejs/kit';
import { z } from 'zod';
import { MAX_FILE_SIZE } from '$lib/modules/files/domain/file';
import { container } from '$lib/server/container';
import { errorResponse } from '$lib/server/http/errors';
import type { RequestHandler } from './$types';

const query = z.object({
	id: z.uuid(),
	projectId: z.uuid().nullable(),
	forMessage: z.boolean()
});

/**
 * The raw file is the body (no multipart): it streams straight to disk, whatever its size.
 * PUT with a real content type needs a CORS preflight, so other sites cannot upload in our name.
 */
export const PUT: RequestHandler = async ({ request, url, locals }) => {
	if (!locals.user) error(401, 'Ta session a expiré : reconnecte-toi.');
	if (!request.body) error(400, 'Le fichier est vide.');
	if (Number(request.headers.get('content-length') ?? 0) > MAX_FILE_SIZE)
		error(413, 'Ce fichier est trop lourd (200 Mo maximum).');
	const params = query.safeParse({
		id: url.searchParams.get('id'),
		projectId: url.searchParams.get('projectId') || null,
		forMessage: url.searchParams.get('for') === 'message'
	});
	if (!params.success) error(400, 'Envoi invalide.');
	try {
		const file = await container.files.upload(
			{
				...params.data,
				name: decodeURIComponent(request.headers.get('x-file-name') ?? ''),
				mime: request.headers.get('content-type') ?? '',
				data: request.body
			},
			locals.user.id
		);
		return json(file);
	} catch (e) {
		return errorResponse(e);
	}
};
