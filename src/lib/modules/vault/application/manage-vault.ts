import { notFound } from '../../kernel/domain/errors';
import {
	validEntryName,
	validEntryNotes,
	validSecret,
	validUrl,
	validUsername,
	type VaultEntry
} from '../domain/entry';
import type { VaultDeps } from './ports';

export interface EntryFields {
	name: string;
	url: string | null;
	username: string | null;
	notes: string;
}

export interface NewEntry extends EntryFields {
	id: string;
	projectId: string;
	secret: string | null;
}

/** `secret`: a new value, `null` to remove it, absent to keep it. */
export type EntryPatch = Partial<EntryFields> & { secret?: string | null };

const encrypt = (deps: VaultDeps, secret: string | null) => {
	const clean = validSecret(secret);
	return clean ? deps.cipher.encrypt(clean) : null;
};

function clean(fields: Partial<EntryFields>): Partial<EntryFields> {
	return {
		...(fields.name !== undefined && { name: validEntryName(fields.name) }),
		...(fields.url !== undefined && { url: validUrl(fields.url) }),
		...(fields.username !== undefined && { username: validUsername(fields.username) }),
		...(fields.notes !== undefined && { notes: validEntryNotes(fields.notes) })
	};
}

export const createEntry = (deps: VaultDeps) => async (input: NewEntry, actorId: string) => {
	if (!(await deps.projectExists(input.projectId))) throw notFound('Projet');
	const now = deps.clock.now().toISOString();
	const cipher = encrypt(deps, input.secret);
	const entry: VaultEntry = {
		id: input.id,
		projectId: input.projectId,
		...(clean(input) as EntryFields),
		hasSecret: cipher !== null,
		createdBy: actorId,
		createdAt: now,
		updatedAt: now
	};
	await deps.vault.insert(entry, cipher);
	deps.feed.saved(entry);
	await deps.activity.record({
		actorId,
		verb: 'vault.added',
		subject: { kind: 'vault', id: entry.id, title: entry.name, projectId: entry.projectId }
	});
	return entry;
};

export const updateEntry = (deps: VaultDeps) => async (id: string, patch: EntryPatch) => {
	const current = await deps.vault.get(id);
	if (!current) throw notFound('Accès');
	const cipher = patch.secret === undefined ? undefined : encrypt(deps, patch.secret);
	const entry: VaultEntry = {
		...current.entry,
		...clean(patch),
		hasSecret: cipher === undefined ? current.entry.hasSecret : cipher !== null,
		updatedAt: deps.clock.now().toISOString()
	};
	await deps.vault.save(entry, cipher);
	deps.feed.saved(entry);
	return entry;
};

export const deleteEntry = (deps: VaultDeps) => async (id: string) => {
	await deps.vault.delete(id);
	deps.feed.removed(id);
};

export const revealSecret = (deps: VaultDeps) => async (id: string) => {
	const found = await deps.vault.get(id);
	if (!found) throw notFound('Accès');
	return { secret: found.cipher ? deps.cipher.decrypt(found.cipher) : null };
};
