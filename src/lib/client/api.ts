import type { StoredFile } from '$lib/modules/files/domain/file';
import type { CommandInput, CommandName, CommandOutput } from '$lib/server/commands/registry';

export class RequestError extends Error {
	constructor(
		message: string,
		readonly status: number
	) {
		super(message);
	}
}

const FALLBACK = 'Ça n’a pas marché. Vérifie ta connexion et réessaie.';

async function failure(response: Response) {
	const body = await response.json().catch(() => null);
	return new RequestError(body?.message ?? FALLBACK, response.status);
}

export async function send<N extends CommandName>(
	name: N,
	input: CommandInput<N>,
	options: { keepalive?: boolean } = {}
): Promise<CommandOutput<N>> {
	const response = await fetch(`/api/commands/${name}`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(input),
		keepalive: options.keepalive
	}).catch(() => {
		throw new RequestError(FALLBACK, 0);
	});
	if (!response.ok) throw await failure(response);
	return response.json();
}

export const errorMessage = (error: unknown) =>
	error instanceof RequestError ? error.message : FALLBACK;

export interface UploadOptions {
	projectId: string;
	folderId?: string | null;
	forMessage?: boolean;
	onProgress?: (ratio: number) => void;
}

/** XHR rather than fetch: it is the only way to show upload progress. */
export function upload(file: File, options: UploadOptions, id = crypto.randomUUID()) {
	return new Promise<StoredFile>((resolve, reject) => {
		const params = new URLSearchParams({ id, projectId: options.projectId });
		if (options.folderId) params.set('folderId', options.folderId);
		if (options.forMessage) params.set('for', 'message');
		const xhr = new XMLHttpRequest();
		xhr.open('PUT', `/api/files?${params}`);
		xhr.setRequestHeader('content-type', file.type || 'application/octet-stream');
		xhr.setRequestHeader('x-file-name', encodeURIComponent(file.name));
		xhr.upload.onprogress = (e) => e.lengthComputable && options.onProgress?.(e.loaded / e.total);
		xhr.onload = () => {
			const body = JSON.parse(xhr.responseText || 'null');
			if (xhr.status < 300) resolve(body as StoredFile);
			else reject(new RequestError(body?.message ?? FALLBACK, xhr.status));
		};
		xhr.onerror = () => reject(new RequestError(FALLBACK, 0));
		xhr.send(file);
	});
}

export const fileUrl = (id: string, download = false) =>
	`/api/files/${id}${download ? '?download' : ''}`;
