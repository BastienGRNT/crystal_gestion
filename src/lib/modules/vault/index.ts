import { createEntry, deleteEntry, revealSecret, updateEntry } from './application/manage-vault';
import type { VaultDeps } from './application/ports';

export function createVault(deps: VaultDeps) {
	return {
		list: () => deps.vault.list(),
		create: createEntry(deps),
		update: updateEntry(deps),
		delete: deleteEntry(deps),
		reveal: revealSecret(deps)
	};
}

export type Vault = ReturnType<typeof createVault>;
