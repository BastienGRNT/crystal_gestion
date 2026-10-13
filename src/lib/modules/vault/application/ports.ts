import type { Access, ActivityLog, ChangeFeed, Clock } from '../../kernel/application/ports';
import type { VaultEntry } from '../domain/entry';

export interface VaultRepository {
	ofProjects(projectIds: string[]): Promise<VaultEntry[]>;
	get(id: string): Promise<{ entry: VaultEntry; cipher: string | null } | null>;
	/** `cipher: undefined` keeps the stored secret as it is. */
	save(entry: VaultEntry, cipher: string | null | undefined): Promise<void>;
	insert(entry: VaultEntry, cipher: string | null): Promise<void>;
	delete(id: string): Promise<void>;
}

export interface SecretCipher {
	encrypt(plain: string): string;
	decrypt(cipher: string): string;
}

export interface VaultDeps {
	vault: VaultRepository;
	cipher: SecretCipher;
	access: Access;
	clock: Clock;
	feed: ChangeFeed<VaultEntry>;
	activity: ActivityLog;
}
