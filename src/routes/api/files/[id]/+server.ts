import { error } from '@sveltejs/kit';
import { byteRange } from '$lib/modules/files/domain/byte-range';
import { isActiveContent, type StoredFile } from '$lib/modules/files/domain/file';
import { DomainError } from '$lib/modules/kernel/domain/errors';
import { container } from '$lib/server/container';
import type { RequestHandler } from './$types';

function headersFor(file: StoredFile, download: boolean): Record<string, string> {
	const attachment = download || isActiveContent(file.mime);
	const headers: Record<string, string> = {
		'content-type':
			attachment && isActiveContent(file.mime) ? 'application/octet-stream' : file.mime,
		'content-disposition': `${attachment ? 'attachment' : 'inline'}; filename*=UTF-8''${encodeURIComponent(file.name)}`,
		'accept-ranges': 'bytes',
		'cache-control': 'private, max-age=31536000, immutable',
		'x-content-type-options': 'nosniff'
	};
	// Uploaded content never runs scripts on our origin (PDF viewers refuse a sandbox, PDFs keep theirs).
	if (file.mime !== 'application/pdf')
		headers['content-security-policy'] =
			"sandbox; default-src 'none'; img-src 'self' data:; media-src 'self'; style-src 'unsafe-inline'";
	return headers;
}

export const GET: RequestHandler = async ({ params, request, url, locals }) => {
	if (!locals.user) error(401, 'Ta session a expiré : reconnecte-toi.');
	if (!/^[0-9a-f-]{36}$/.test(params.id)) error(404, 'Fichier introuvable.');
	const file = await container.files.get(params.id, locals.user.id).catch((e) => {
		if (e instanceof DomainError) error(e.code === 'forbidden' ? 403 : 404, e.message);
		throw e;
	});
	const headers = headersFor(file, url.searchParams.has('download'));
	const range = byteRange(request.headers.get('range'), file.size);
	if (range === 'unsatisfiable')
		return new Response(null, {
			status: 416,
			headers: { 'content-range': `bytes */${file.size}` }
		});
	try {
		const { stream } = await container.files.open(file.id, locals.user.id, range ?? undefined);
		if (!range)
			return new Response(stream, { headers: { ...headers, 'content-length': String(file.size) } });
		return new Response(stream, {
			status: 206,
			headers: {
				...headers,
				'content-range': `bytes ${range.start}-${range.end}/${file.size}`,
				'content-length': String(range.end - range.start + 1)
			}
		});
	} catch (e) {
		if (e instanceof DomainError) error(404, e.message);
		throw e;
	}
};
