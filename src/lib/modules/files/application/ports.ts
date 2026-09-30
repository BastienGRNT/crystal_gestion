/** Where file bytes live: local disk in V1, object storage later. */
export interface FileStorage {
	save(key: string, bytes: Uint8Array): Promise<void>;
	read(key: string): Promise<Uint8Array>;
	remove(key: string): Promise<void>;
}

export interface FileFields {
	title: string;
	featureId: string | null;
	mimeType: string;
	size: number;
	storageKey: string;
}
