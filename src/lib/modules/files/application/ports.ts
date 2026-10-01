import type { Folder } from '../domain/folder';

/** Where file bytes live: local disk in V1, object storage later. */
export interface FileStorage {
	save(key: string, bytes: Uint8Array): Promise<void>;
	read(key: string): Promise<Uint8Array>;
	remove(key: string): Promise<void>;
}

export interface FileFields {
	title: string;
	featureId: string | null;
	folderId: string | null;
	mimeType: string;
	size: number;
	storageKey: string;
}

export interface FolderRepository {
	create(folder: Omit<Folder, 'id' | 'createdAt'>): Promise<Folder>;
	rename(projectId: string, id: string, name: string): Promise<Folder | null>;
	delete(projectId: string, id: string): Promise<boolean>;
	find(projectId: string, id: string): Promise<Folder | null>;
	list(projectId: string): Promise<Folder[]>;
	/** No file and no sub-folder inside. */
	isEmpty(id: string): Promise<boolean>;
}
