import { createFolder, deleteFolder, updateFolder } from './application/folders';
import {
	attachToMessage,
	deleteFile,
	getFile,
	openFile,
	updateFile,
	uploadFile
} from './application/manage-files';
import type { FileDeps } from './application/ports';

export function createFiles(deps: FileDeps) {
	return {
		ofProjects: (projectIds: string[]) => deps.files.ofProjects(projectIds),
		foldersOf: (projectIds: string[]) => deps.folders.ofProjects(projectIds),
		get: getFile(deps),
		upload: uploadFile(deps),
		update: updateFile(deps),
		delete: deleteFile(deps),
		open: openFile(deps),
		attachToMessage: attachToMessage(deps),
		createFolder: createFolder(deps),
		updateFolder: updateFolder(deps),
		deleteFolder: deleteFolder(deps)
	};
}

export type Files = ReturnType<typeof createFiles>;
