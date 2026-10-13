import type { VaultEntry } from '$lib/modules/vault/domain/entry';
import { errorMessage, send } from '../api';
import type { AppState } from '../state/app.svelte';
import { deleteWithUndo, toasts } from '../toasts.svelte';

export interface EntryForm {
	name: string;
	url: string;
	username: string;
	notes: string;
	/** `undefined` while editing means "leave the password as it is". */
	secret?: string;
}

/** Vault writes wait for the server: it normalizes links and holds the only copy of secrets. */
export function vaultActions(app: AppState) {
	async function run<T>(request: Promise<T>): Promise<T | null> {
		try {
			return await request;
		} catch (error) {
			toasts.error(errorMessage(error));
			return null;
		}
	}

	return {
		async create(projectId: string, form: EntryForm) {
			const entry = await run(
				send('vault.create', {
					id: crypto.randomUUID(),
					projectId,
					...form,
					secret: form.secret || null
				})
			);
			if (entry) app.vault.upsert(entry);
			return entry;
		},

		async update(id: string, form: EntryForm) {
			const { secret, ...fields } = form;
			const patch = secret === undefined ? fields : { ...fields, secret: secret || null };
			const entry = await run(send('vault.update', { id, ...patch }));
			if (entry) app.vault.upsert(entry);
			return entry;
		},

		remove(entry: VaultEntry) {
			deleteWithUndo(
				`« ${entry.name} » supprimé`,
				() => app.vault.remove(entry.id),
				() => app.vault.upsert(entry),
				() =>
					void send('vault.delete', { id: entry.id }, { keepalive: true }).catch(() =>
						app.vault.upsert(entry)
					)
			);
		},

		reveal: async (id: string) => (await run(send('vault.reveal', { id })))?.secret ?? null,

		async copy(text: string | null, what: string) {
			if (!text) return;
			try {
				await navigator.clipboard.writeText(text);
				toasts.show(`${what} copié`, { tone: 'success', duration: 2000 });
			} catch {
				toasts.error('Impossible de copier : ton navigateur l’a refusé.');
			}
		}
	};
}
