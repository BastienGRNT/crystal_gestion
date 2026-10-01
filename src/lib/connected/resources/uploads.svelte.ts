import { toasts } from '$lib/client/toasts.svelte';
import type { FileLocation } from '$lib/modules/files/domain/folder';
import { MAX_FILE_BYTES } from '$lib/modules/files/domain/project-file';

export interface PendingUpload {
	id: number;
	name: string;
	size: number;
	location: FileLocation;
}

type Upload = (file: File, location: FileLocation) => Promise<unknown>;

/** Files being sent, shown as placeholders in their folder until the server answers. */
export class UploadQueue {
	pending = $state<PendingUpload[]>([]);
	private nextId = 0;

	constructor(private upload: Upload) {}

	add(files: File[], location: FileLocation) {
		const accepted = files.filter((file) => file.size <= MAX_FILE_BYTES);
		for (const file of files)
			if (!accepted.includes(file)) toasts.error(`${file.name} dépasse 50 Mo`);
		return Promise.all(accepted.map((file) => this.send(file, location)));
	}

	private async send(file: File, location: FileLocation) {
		const item = { id: this.nextId++, name: file.name, size: file.size, location };
		this.pending.push(item);
		try {
			await this.upload(file, location);
		} finally {
			this.pending = this.pending.filter((pending) => pending.id !== item.id);
		}
	}
}
