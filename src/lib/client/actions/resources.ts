import type {
	AccountFields,
	ContactFields,
	LinkFields
} from '$lib/modules/resources/domain/resources';
import { send } from '../commands';
import { attempt, optimistic } from '../live/optimistic';
import type { ProjectStore } from '../project-store.svelte';
import { deleteWithUndo } from '../live/undoable';

type Input<F> = Partial<F> & { title: string };

/** Resources are created from a small inline form: waiting for the server keeps refs exact. */
export function resourceActions(store: ProjectStore) {
	const projectId = () => store.project.id;
	const target = (id: string) => ({ projectId: projectId(), id });
	return {
		createAccount: (input: Input<AccountFields>) =>
			attempt(async () =>
				store.upsert('account', await send('accounts.create', { projectId: projectId(), ...input }))
			),
		updateAccount: (id: string, changes: Partial<AccountFields>) =>
			optimistic(
				() => store.accounts.patch(id, changes),
				() => send('accounts.update', { ...target(id), changes })
			),
		removeAccount: (id: string) =>
			deleteWithUndo(
				'Compte supprimé',
				() => store.accounts.remove(id),
				() => send('accounts.delete', target(id))
			),
		createLink: (input: Input<LinkFields>) =>
			attempt(async () =>
				store.upsert('link', await send('links.create', { projectId: projectId(), ...input }))
			),
		updateLink: (id: string, changes: Partial<LinkFields>) =>
			optimistic(
				() => store.links.patch(id, changes),
				() => send('links.update', { ...target(id), changes })
			),
		removeLink: (id: string) =>
			deleteWithUndo(
				'Lien supprimé',
				() => store.links.remove(id),
				() => send('links.delete', target(id))
			),
		createContact: (input: Input<ContactFields>) =>
			attempt(async () =>
				store.upsert('contact', await send('contacts.create', { projectId: projectId(), ...input }))
			),
		updateContact: (id: string, changes: Partial<ContactFields>) =>
			optimistic(
				() => store.contacts.patch(id, changes),
				() => send('contacts.update', { ...target(id), changes })
			),
		removeContact: (id: string) =>
			deleteWithUndo(
				'Contact supprimé',
				() => store.contacts.remove(id),
				() => send('contacts.delete', target(id))
			)
	};
}
