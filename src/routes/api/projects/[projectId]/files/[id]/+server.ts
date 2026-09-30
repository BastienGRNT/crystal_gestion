import { byteRange } from '$lib/modules/files/domain/byte-range';
import { container } from '$lib/server/container';
import { toHttpError } from '$lib/server/http/errors';
import { requireMember } from '$lib/server/http/guard';
import type { RequestHandler } from './$types';

/** Inline by default (previews); `?download` forces a download. Honours byte ranges for media. */
export const GET: RequestHandler = async ({ params, locals, url, request }) => {
	await requireMember(locals, params.projectId);
	try {
		const { file, bytes } = await container.files.read({
			projectId: params.projectId,
			id: params.id
		});
		const disposition = url.searchParams.has('download') ? 'attachment' : 'inline';
		const headers: Record<string, string> = {
			'content-type': file.mimeType,
			'accept-ranges': 'bytes',
			'content-disposition': `${disposition}; filename*=UTF-8''${encodeURIComponent(file.title)}`,
			'x-content-type-options': 'nosniff',
			// An uploaded HTML/SVG opened inline must not run scripts on our origin; PDFs need a viewer.
			...(file.mimeType === 'application/pdf' ? {} : { 'content-security-policy': 'sandbox' })
		};
		const range = byteRange(request.headers.get('range'), bytes.length);
		if (range === 'unsatisfiable')
			return new Response(null, {
				status: 416,
				headers: { 'content-range': `bytes */${bytes.length}` }
			});
		const body = range ? bytes.subarray(range.start, range.end + 1) : bytes;
		if (range) headers['content-range'] = `bytes ${range.start}-${range.end}/${bytes.length}`;
		headers['content-length'] = String(body.length);
		return new Response(new Blob([new Uint8Array(body)]), { status: range ? 206 : 200, headers });
	} catch (cause) {
		toHttpError(cause);
	}
};
