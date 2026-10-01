/** A sub-folder of « Général » or of a feature's folder; folders can nest. */
export interface Folder {
	id: string;
	projectId: string;
	featureId: string | null;
	parentId: string | null;
	name: string;
	createdAt: string;
}

/** Where a file or a folder sits: a root (Général or a feature) and, optionally, a sub-folder. */
export interface FileLocation {
	featureId: string | null;
	folderId: string | null;
}

/** Folders from the root down to `folderId`, for breadcrumbs and « Déplacer vers… » labels. */
export function folderPath(folders: Folder[], folderId: string | null): Folder[] {
	const path: Folder[] = [];
	for (let id = folderId; id;) {
		const folder = folders.find((f) => f.id === id);
		if (!folder || path.includes(folder)) break;
		path.unshift(folder);
		id = folder.parentId;
	}
	return path;
}

export const sameLocation = (a: FileLocation, b: FileLocation) =>
	a.featureId === b.featureId && a.folderId === b.folderId;

/** Files and sub-folders directly at `location`. */
export function contentsOf<F extends FileLocation>(
	location: FileLocation,
	files: F[],
	folders: Folder[]
) {
	return {
		files: files.filter((file) => sameLocation(file, location)),
		folders: folders.filter(
			(f) => f.featureId === location.featureId && f.parentId === location.folderId
		)
	};
}
