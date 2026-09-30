import type { ProjectContext } from '$lib/client/context';
import type { ElementSummary } from '$lib/modules/kernel/domain/element';

/** The same few operations for the three resource kinds, so one detail view serves them all. */
export function resourceOps({ store, actions }: ProjectContext, { id, kind }: ElementSummary) {
	const r = actions.resources;
	if (kind === 'account')
		return {
			item: () => store.accounts.get(id),
			rename: (title: string) => r.updateAccount(id, { title }),
			move: (featureId: string | null) => r.updateAccount(id, { featureId }),
			remove: () => r.removeAccount(id)
		};
	if (kind === 'link')
		return {
			item: () => store.links.get(id),
			rename: (title: string) => r.updateLink(id, { title }),
			move: (featureId: string | null) => r.updateLink(id, { featureId }),
			remove: () => r.removeLink(id)
		};
	return {
		item: () => store.contacts.get(id),
		rename: (title: string) => r.updateContact(id, { title }),
		move: () => undefined,
		remove: () => r.removeContact(id)
	};
}
