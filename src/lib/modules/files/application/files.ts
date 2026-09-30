import type { ElementCrud, Target } from '$lib/modules/kernel/application/element-crud';
import type { Actor } from '$lib/modules/kernel/domain/actor';
import { invalid } from '$lib/modules/kernel/domain/errors';
import { MAX_FILE_BYTES, type ProjectFile } from '../domain/project-file';
import type { FileFields, FileStorage } from './ports';

interface Deps {
	files: ElementCrud<ProjectFile, FileFields>;
	storage: FileStorage;
	newKey: () => string;
}

export interface Upload {
	projectId: string;
	featureId: string | null;
	name: string;
	mimeType: string;
	bytes: Uint8Array;
}

export const makeUploadFile = (deps: Deps) => async (actor: Actor, upload: Upload) => {
	if (upload.bytes.byteLength > MAX_FILE_BYTES) throw invalid('Fichier trop lourd (50 Mo max)');
	const storageKey = `${upload.projectId}/${deps.newKey()}`;
	await deps.storage.save(storageKey, upload.bytes);
	return deps.files.create(actor, {
		projectId: upload.projectId,
		featureId: upload.featureId,
		title: upload.name,
		mimeType: upload.mimeType || 'application/octet-stream',
		size: upload.bytes.byteLength,
		storageKey
	});
};

export const makeDeleteFile = (deps: Deps) => async (actor: Actor, target: Target) => {
	const file = await deps.files.remove(actor, target);
	await deps.storage.remove(file.storageKey);
};

export const makeReadFile = (deps: Deps) => async (target: Target) => {
	const file = await deps.files.find(target);
	return { file, bytes: await deps.storage.read(file.storageKey) };
};
