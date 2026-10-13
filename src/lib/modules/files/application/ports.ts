import type { ActivityLog, ChangeFeed, Clock } from '../../kernel/application/ports';
import type { StoredFile } from '../domain/file';

export interface FileRepository {
	list(): Promise<StoredFile[]>;
	get(id: string): Promise<StoredFile | null>;
	insert(file: StoredFile): Promise<void>;
	save(file: StoredFile): Promise<void>;
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
	blobs: BlobStorage;
	projectExists(id: string): Promise<boolean>;
	clock: Clock;
	feed: ChangeFeed<StoredFile>;
	activity: ActivityLog;
}
