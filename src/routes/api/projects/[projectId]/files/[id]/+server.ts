import { container } from '$lib/server/container';
import { toHttpError } from '$lib/server/http/errors';
import { requireMember } from '$lib/server/http/guard';
import type { RequestHandler } from './$types';

/** Inline by default (previews); `?download` forces a download. */
export const GET: RequestHandler = async ({ params, locals, url }) => {
	await requireMember(locals, params.projectId);
	try {
		const { file, bytes } = await container.files.read({
			projectId: params.projectId,
			id: params.id
		});
		const disposition = url.searchParams.has('download') ? 'attachment' : 'inline';
		return new Response(new Blob([new Uint8Array(bytes)]), {
			headers: {
				'content-type': file.mimeType,
				'content-length': String(file.size),
				'content-disposition': `${disposition}; filename*=UTF-8''${encodeURIComponent(file.title)}`,
				'x-content-type-options': 'nosniff'
			}
		});
	} catch (cause) {
		toHttpError(cause);
	}
};
