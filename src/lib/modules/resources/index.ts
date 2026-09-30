import { makeElementCrud, type ElementStore } from '$lib/modules/kernel/application/element-crud';
import type { ActivityLog, ChangeFeed, ReferenceSync } from '$lib/modules/kernel/application/ports';
import type {
	Account,
	AccountFields,
	Contact,
	ContactFields,
	Link,
	LinkFields
} from './domain/resources';

interface Shared {
	feed: ChangeFeed;
	activity: ActivityLog;
	references: ReferenceSync;
}

export function createResourcesModule(
	deps: Shared & {
		accounts: ElementStore<Account, AccountFields>;
		links: ElementStore<Link, LinkFields>;
		contacts: ElementStore<Contact, ContactFields>;
	}
) {
	return {
		accounts: makeElementCrud({
			...deps,
			store: deps.accounts,
			entity: 'account',
			textsOf: (a: Account) => [a.notes]
		}),
		links: makeElementCrud({ ...deps, store: deps.links, entity: 'link', textsOf: () => [] }),
		contacts: makeElementCrud({
			...deps,
			store: deps.contacts,
			entity: 'contact',
			textsOf: (c: Contact) => [c.notes]
		})
	};
}

export type ResourcesModule = ReturnType<typeof createResourcesModule>;
