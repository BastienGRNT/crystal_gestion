import { makeElementCrud, type ElementStore } from '$lib/modules/kernel/application/element-crud';
import type { ActivityLog, ChangeFeed, ReferenceSync } from '$lib/modules/kernel/application/ports';
import type { Actor } from '$lib/modules/kernel/domain/actor';
import { makeDeleteFile, makeReadFile, makeUploadFile, type Upload } from './application/files';
import { makeFolderUseCases, makeResolveLocation } from './application/folders';
import type { FileFields, FileStorage, FolderRepository } from './application/ports';
import type { ProjectFile } from './domain/project-file';

type FileChanges = { projectId: string; id: string; changes: Partial<FileFields> };

export function createFilesModule(deps: {
	store: ElementStore<ProjectFile, FileFields>;
	folders: FolderRepository;
	storage: FileStorage;
	newKey: () => string;
	feed: ChangeFeed;
	activity: ActivityLog;
	references: ReferenceSync;
}) {
	const files = makeElementCrud({ ...deps, entity: 'file', textsOf: () => [] });
	const withCrud = { ...deps, files };
	const resolve = makeResolveLocation(deps);
	const upload = makeUploadFile(withCrud);
	return {
		upload: async (actor: Actor, input: Upload) =>
			upload(actor, { ...input, ...(await resolve(input.projectId, input)) }),
		read: makeReadFile(withCrud),
		remove: makeDeleteFile(withCrud),
		update: async (actor: Actor, { projectId, id, changes }: FileChanges) => {
			const moved = changes.folderId !== undefined || changes.featureId !== undefined;
			const location = moved
				? await resolve(projectId, {
						featureId: changes.featureId ?? null,
						folderId: changes.folderId ?? null
					})
				: {};
			return files.update(actor, { projectId, id, changes: { ...changes, ...location } });
		},
		list: files.list,
		folders: makeFolderUseCases(deps)
	};
}

export type FilesModule = ReturnType<typeof createFilesModule>;
