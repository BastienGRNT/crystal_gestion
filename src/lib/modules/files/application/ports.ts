import type { Access, ActivityLog, ChangeFeed, Clock } from '../../kernel/application/ports';
import type { StoredFile } from '../domain/file';
import type { Folder } from '../domain/folder';

export interface FileRepository {
	ofProjects(projectIds: string[]): Promise<StoredFile[]>;
	inFolders(folderIds: string[]): Promise<StoredFile[]>;
	get(id: string): Promise<StoredFile | null>;
	insert(file: StoredFile): Promise<void>;
	save(file: StoredFile): Promise<void>;
	delete(id: string): Promise<void>;
}

export interface FolderRepository {
	ofProjects(projectIds: string[]): Promise<Folder[]>;
	get(id: string): Promise<Folder | null>;
	chatFolder(projectId: string): Promise<Folder | null>;
	insert(folder: Folder): Promise<void>;
	save(folder: Folder): Promise<void>;
	/** Subfolders go with it (cascade); their files must be removed first. */
	delete(id: string): Promise<void>;
}

export interface BlobStorage {
	/** Streams to disk and returns the byte count; gives up past `maxBytes`. */
	write(key: string, data: ReadableStream<Uint8Array>, maxBytes: number): Promise<number>;
	read(key: string, range?: { start: number; end: number }): ReadableStream<Uint8Array>;
	remove(key: string): Promise<void>;
}

export interface FileDeps {
	files: FileRepository;
	folders: FolderRepository;
	blobs: BlobStorage;
	access: Access;
	clock: Clock;
	feed: ChangeFeed<StoredFile>;
	folderFeed: ChangeFeed<Folder>;
	activity: ActivityLog;
}
