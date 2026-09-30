import { error, json } from '@sveltejs/kit';
import { container } from '$lib/server/container';
import { toHttpError } from '$lib/server/http/errors';
import { requireMember } from '$lib/server/http/guard';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request, locals }) => {
	const actor = await requireMember(locals, params.projectId);
	const data = await request.formData();
	const file = data.get('file');
	if (!(file instanceof File)) error(400, 'Aucun fichier reçu');
	const featureId = data.get('featureId');
	try {
		const created = await container.files.upload(actor, {
			projectId: params.projectId,
			featureId: typeof featureId === 'string' && featureId ? featureId : null,
			name: file.name,
			mimeType: file.type,
			bytes: new Uint8Array(await file.arrayBuffer())
		});
		return json(created);
	} catch (cause) {
		toHttpError(cause);
	}
};
