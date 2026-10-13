import type { Attachment } from '../../chat/domain/chat';
import { ensure, notFound } from '../../kernel/domain/errors';
import { MAX_FILE_SIZE, validFileName, type StoredFile } from '../domain/file';
import { chatFolder, checkFolder } from './folders';
import type { FileDeps } from './ports';

export interface UploadInput {
	id: string;
	projectId: string;
	folderId: string | null;
	name: string;
	mime: string;
	/** Sent with a message: filed under the discussion folder, the message says the rest. */
	forMessage: boolean;
	data: ReadableStream<Uint8Array>;
}

export const uploadFile = (deps: FileDeps) => async (input: UploadInput, actorId: string) => {
	await deps.access.assertMember(input.projectId, actorId);
	const folderId = input.forMessage
		? (await chatFolder(deps, input.projectId, actorId)).id
		: input.folderId;
	await checkFolder(deps, input.projectId, folderId, actorId);
	const name = validFileName(input.name);
	const size = await deps.blobs.write(input.id, input.data, MAX_FILE_SIZE);
	const file: StoredFile = {
		id: input.id,
		projectId: input.projectId,
		folderId,
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

async function memberFile(deps: FileDeps, id: string, actorId: string) {
	const file = await deps.files.get(id);
	if (!file) throw notFound('Fichier');
	await deps.access.assertMember(file.projectId, actorId);
	return file;
}

export const updateFile =
	(deps: FileDeps) =>
	async (id: string, patch: { name?: string; folderId?: string | null }, actorId: string) => {
		const file = { ...(await memberFile(deps, id, actorId)) };
		if (patch.name !== undefined) file.name = validFileName(patch.name);
		if (patch.folderId !== undefined) {
			await checkFolder(deps, file.projectId, patch.folderId, actorId);
			file.folderId = patch.folderId;
		}
		await deps.files.save(file);
		deps.feed.saved(file);
		return file;
	};

export const deleteFile = (deps: FileDeps) => async (id: string, actorId: string) => {
	const file = await memberFile(deps, id, actorId);
	await deps.files.delete(id);
	await deps.blobs.remove(id);
	deps.feed.removed(file);
};

export const openFile =
	(deps: FileDeps) =>
	async (id: string, actorId: string, range?: { start: number; end: number }) => {
		const file = await memberFile(deps, id, actorId);
		return { file, stream: deps.blobs.read(file.id, range) };
	};

export const getFile = (deps: FileDeps) => (id: string, actorId: string) =>
	memberFile(deps, id, actorId);

/** Links freshly uploaded files to the message that shares them. */
export const attachToMessage =
	(deps: FileDeps) =>
	async (
		ids: string[],
		messageId: string,
		projectId: string,
		actorId: string
	): Promise<Attachment[]> => {
		const attachments: Attachment[] = [];
		for (const id of ids) {
			const current = await memberFile(deps, id, actorId);
			ensure(current.projectId === projectId, 'Ce fichier appartient à un autre projet.');
			ensure(current.messageId === null, 'Ce fichier est déjà partagé dans un autre message.');
			const file = { ...current, messageId };
			await deps.files.save(file);
			deps.feed.saved(file);
			attachments.push({ id: file.id, name: file.name, mime: file.mime, size: file.size });
		}
		return attachments;
	};
