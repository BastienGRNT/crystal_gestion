import type { Attachment } from '../../chat/domain/chat';
import { ensure, notFound } from '../../kernel/domain/errors';
import { MAX_FILE_SIZE, validFileName, type StoredFile } from '../domain/file';
import type { FileDeps } from './ports';

export interface UploadInput {
	id: string;
	projectId: string | null;
	name: string;
	mime: string;
	/** Sent with a message: the message itself says it, no separate activity line. */
	forMessage: boolean;
	data: ReadableStream<Uint8Array>;
}

export const uploadFile = (deps: FileDeps) => async (input: UploadInput, actorId: string) => {
	if (input.projectId && !(await deps.projectExists(input.projectId))) throw notFound('Projet');
	const name = validFileName(input.name);
	const size = await deps.blobs.write(input.id, input.data, MAX_FILE_SIZE);
	const file: StoredFile = {
		id: input.id,
		projectId: input.projectId,
		name,
		mime: input.mime || 'application/octet-stream',
		size,
		uploadedBy: actorId,
		createdAt: deps.clock.now().toISOString(),
		messageId: null
	};
	await deps.files.insert(file);
	deps.feed.saved(file);
	if (!input.forMessage)
		await deps.activity.record({
			actorId,
			verb: 'file.uploaded',
			subject: { kind: 'file', id: file.id, title: file.name, projectId: file.projectId }
		});
	return file;
};

async function existing(deps: FileDeps, id: string) {
	const file = await deps.files.get(id);
	if (!file) throw notFound('Fichier');
	return file;
}

export const renameFile = (deps: FileDeps) => async (id: string, name: string) => {
	const file = { ...(await existing(deps, id)), name: validFileName(name) };
	await deps.files.save(file);
	deps.feed.saved(file);
	return file;
};

export const deleteFile = (deps: FileDeps) => async (id: string) => {
	await existing(deps, id);
	await deps.files.delete(id);
	await deps.blobs.remove(id);
	deps.feed.removed(id);
};

export const openFile =
	(deps: FileDeps) => async (id: string, range?: { start: number; end: number }) => {
		const file = await existing(deps, id);
		return { file, stream: deps.blobs.read(file.id, range) };
	};

/** Links freshly uploaded files to the message that shares them. */
export const attachToMessage =
	(deps: FileDeps) =>
	async (ids: string[], messageId: string, projectId: string | null): Promise<Attachment[]> => {
		const attachments: Attachment[] = [];
		for (const id of ids) {
			const current = await existing(deps, id);
			ensure(current.messageId === null, 'Ce fichier est déjà partagé dans un autre message.');
			const file = { ...current, messageId, projectId };
			await deps.files.save(file);
			deps.feed.saved(file);
			attachments.push({ id: file.id, name: file.name, mime: file.mime, size: file.size });
		}
		return attachments;
	};
