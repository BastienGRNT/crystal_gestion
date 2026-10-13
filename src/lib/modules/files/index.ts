import {
	attachToMessage,
	deleteFile,
	openFile,
	renameFile,
	uploadFile
} from './application/manage-files';
import type { FileDeps } from './application/ports';

export function createFiles(deps: FileDeps) {
	return {
		list: () => deps.files.list(),
		get: (id: string) => deps.files.get(id),
		upload: uploadFile(deps),
		rename: renameFile(deps),
		delete: deleteFile(deps),
		open: openFile(deps),
		attachToMessage: attachToMessage(deps)
	};
}

export type Files = ReturnType<typeof createFiles>;
