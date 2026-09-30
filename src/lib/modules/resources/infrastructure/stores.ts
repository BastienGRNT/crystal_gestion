import type { Executor } from '$lib/server/db/types';
import { drizzleElementStore } from '../../elements/infrastructure/element-store';
import type { SecretCipher } from '../application/ports';
import type {
	Account,
	AccountFields,
	Contact,
	ContactFields,
	Link,
	LinkFields
} from '../domain/resources';
import { accounts, contacts, resourceLinks } from './schema';

const base = <K extends string>(kind: K) => ({
	titleOf: (fields: { title?: string }) => fields.title,
	meta: (meta: { ref: string; title: string; createdAt: string }) => ({
		kind,
		ref: meta.ref,
		title: meta.title,
		createdAt: meta.createdAt
	})
});

export const drizzleAccountStore = (db: Executor, cipher: SecretCipher) =>
	drizzleElementStore<typeof accounts, Account, AccountFields>(db, {
		table: accounts,
		kind: () => 'account',
		titleOf: base('account').titleOf,
		toRow: ({ title: _title, secret, ...fields }) => ({
			...fields,
			secret: secret === undefined ? undefined : cipher.encrypt(secret)
		}),
		toElement: (row, meta) => ({
			...row,
			...base('account' as const).meta(meta),
			secret: cipher.decrypt(row.secret)
		})
	});

export const drizzleLinkStore = (db: Executor) =>
	drizzleElementStore<typeof resourceLinks, Link, LinkFields>(db, {
		table: resourceLinks,
		kind: () => 'link',
		titleOf: base('link').titleOf,
		toRow: ({ title: _title, ...fields }) => fields,
		toElement: (row, meta) => ({ ...row, ...base('link' as const).meta(meta) })
	});

export const drizzleContactStore = (db: Executor) =>
	drizzleElementStore<typeof contacts, Contact, ContactFields>(db, {
		table: contacts,
		kind: () => 'contact',
		titleOf: base('contact').titleOf,
		toRow: ({ title: _title, ...fields }) => fields,
		toElement: (row, meta) => ({ ...row, ...base('contact' as const).meta(meta) })
	});

export const plainTextCipher: SecretCipher = {
	encrypt: (plain) => plain,
	decrypt: (stored) => stored
};
