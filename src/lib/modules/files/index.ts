import { makeElementCrud, type ElementStore } from '$lib/modules/kernel/application/element-crud';
import type { ActivityLog, ChangeFeed, ReferenceSync } from '$lib/modules/kernel/application/ports';
import { makeDeleteFile, makeReadFile, makeUploadFile } from './application/files';
import type { FileFields, FileStorage } from './application/ports';
import type { ProjectFile } from './domain/project-file';

export function createFilesModule(deps: {
	store: ElementStore<ProjectFile, FileFields>;
	storage: FileStorage;
	newKey: () => string;
	feed: ChangeFeed;
	activity: ActivityLog;
	references: ReferenceSync;
}) {
	const files = makeElementCrud({ ...deps, entity: 'file', textsOf: () => [] });
	const withCrud = { ...deps, files };
	return {
		upload: makeUploadFile(withCrud),
		read: makeReadFile(withCrud),
		remove: makeDeleteFile(withCrud),
		update: files.update,
		list: files.list
	};
}

export type FilesModule = ReturnType<typeof createFilesModule>;
