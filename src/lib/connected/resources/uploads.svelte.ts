import { toasts } from '$lib/client/toasts.svelte';
import { MAX_FILE_BYTES } from '$lib/modules/files/domain/project-file';

export interface PendingUpload {
	id: number;
	name: string;
	size: number;
	featureId: string | null;
}

type Upload = (file: File, featureId: string | null) => Promise<unknown>;

/** Files being sent, shown as placeholders in their folder until the server answers. */
export class UploadQueue {
	pending = $state<PendingUpload[]>([]);
	private nextId = 0;

	constructor(private upload: Upload) {}

	add(files: File[], featureId: string | null) {
		const accepted = files.filter((file) => file.size <= MAX_FILE_BYTES);
		for (const file of files)
			if (!accepted.includes(file)) toasts.error(`${file.name} dépasse 50 Mo`);
		return Promise.all(accepted.map((file) => this.send(file, featureId)));
	}

	private async send(file: File, featureId: string | null) {
		const item = { id: this.nextId++, name: file.name, size: file.size, featureId };
		this.pending.push(item);
		try {
			await this.upload(file, featureId);
		} finally {
			this.pending = this.pending.filter((pending) => pending.id !== item.id);
		}
	}
}
