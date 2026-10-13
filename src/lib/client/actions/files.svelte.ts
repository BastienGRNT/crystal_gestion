import { MAX_FILE_SIZE, validFileName, type StoredFile } from '$lib/modules/files/domain/file';
import { subtree, validFolderName, type Folder } from '$lib/modules/files/domain/folder';
import { errorMessage, send, upload } from '../api';
import type { AppState } from '../state/app.svelte';
import { deleteWithUndo, toasts } from '../toasts.svelte';
import { attempt, settle } from './optimistic';

export interface Upload {
	id: string;
	name: string;
	progress: number;
	projectId: string;
	folderId: string | null;
}

/** Uploads in flight, shown as progress rows wherever they were started. */
class Uploads {
	items = $state<Upload[]>([]);

	track(item: Upload) {
		this.items = [...this.items, item];
	}
	progress(id: string, progress: number) {
		this.items = this.items.map((u) => (u.id === id ? { ...u, progress } : u));
	}
	done(id: string) {
		this.items = this.items.filter((u) => u.id !== id);
	}
}

export const uploads = new Uploads();

export function fileActions(app: AppState) {
	function updateFile(id: string, patch: { name?: string; folderId?: string | null }) {
		const current = app.files.get(id);
		if (!current) return;
		app.files.upsert({ ...current, ...patch });
		settle(
			app,
			id,
			send('files.update', { id, ...patch }),
			(f) => app.files.upsert(f),
			() => app.files.upsert(current)
		);
	}

	function updateFolder(id: string, patch: { name?: string; parentId?: string | null }) {
		const current = app.folders.get(id);
		if (!current) return;
		app.folders.upsert({ ...current, ...patch });
		settle(
			app,
			id,
			send('folders.update', { id, ...patch }),
			(f) => app.folders.upsert(f),
			() => app.folders.upsert(current)
		);
	}

	return {
		async upload(
			file: File,
			projectId: string,
			folderId: string | null,
			forMessage = false
		): Promise<StoredFile | null> {
			if (file.size > MAX_FILE_SIZE) {
				toasts.error(`« ${file.name} » est trop lourd (200 Mo maximum).`);
				return null;
			}
			const id = crypto.randomUUID();
			uploads.track({ id, name: file.name, progress: 0, projectId, folderId });
			try {
				const stored = await upload(
					file,
					{ projectId, folderId, forMessage, onProgress: (ratio) => uploads.progress(id, ratio) },
					id
				);
				app.files.upsert(stored);
				return stored;
			} catch (error) {
				toasts.error(`« ${file.name} » : ${errorMessage(error)}`);
				return null;
			} finally {
				uploads.done(id);
			}
		},

		rename(id: string, name: string) {
			const clean = attempt(() => validFileName(name));
			if (clean && clean !== app.files.get(id)?.name) updateFile(id, { name: clean });
		},
		move: (id: string, folderId: string | null) => updateFile(id, { folderId }),

		remove(id: string) {
			const file = app.files.get(id);
			if (!file) return;
			deleteWithUndo(
				`« ${file.name} » supprimé`,
				() => app.files.remove(id),
				() => app.files.upsert(file),
				() =>
					void send('files.delete', { id }, { keepalive: true }).catch(() => app.files.upsert(file))
			);
		},

		createFolder(projectId: string, parentId: string | null, name: string): Folder | null {
			const clean = attempt(() => validFolderName(name));
			if (!clean) return null;
			const folder: Folder = {
				id: crypto.randomUUID(),
				projectId,
				parentId,
				name: clean,
				system: null,
				createdBy: app.meId,
				createdAt: new Date().toISOString()
			};
			app.folders.upsert(folder);
			settle(
				app,
				folder.id,
				send('folders.create', { id: folder.id, projectId, parentId, name: clean }),
				(f) => app.folders.upsert(f),
				() => app.folders.remove(folder.id)
			);
			return folder;
		},

		renameFolder(id: string, name: string) {
			const clean = attempt(() => validFolderName(name));
			if (clean) updateFolder(id, { name: clean });
		},
		moveFolder: (id: string, parentId: string | null) => updateFolder(id, { parentId }),

		/** Hides the folder and its content at once; the server deletes them if not undone. */
		removeFolder(id: string, onHidden: () => void) {
			const folder = app.folders.get(id);
			if (!folder) return;
			const ids = subtree(app.folders.all, id);
			const folders = app.folders.all.filter((f) => ids.includes(f.id));
			const files = app.files.all.filter((f) => f.folderId && ids.includes(f.folderId));
			deleteWithUndo(
				`Dossier « ${folder.name} » supprimé${files.length ? ` avec ${files.length} fichier${files.length > 1 ? 's' : ''}` : ''}`,
				() => {
					folders.forEach((f) => app.folders.remove(f.id));
					files.forEach((f) => app.files.remove(f.id));
					onHidden();
				},
				() => {
					folders.forEach((f) => app.folders.upsert(f));
					files.forEach((f) => app.files.upsert(f));
				},
				() =>
					void send('folders.delete', { id }, { keepalive: true }).catch(() =>
						folders.forEach((f) => app.folders.upsert(f))
					)
			);
		}
	};
}
