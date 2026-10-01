import { Contact, KeyRound, Link } from '@lucide/svelte';

export const RESOURCE_TABS = [
	{ value: 'accounts', label: 'Comptes partagés', short: 'Comptes', icon: KeyRound },
	{ value: 'links', label: 'Liens', icon: Link },
	{ value: 'contacts', label: 'Contacts', icon: Contact }
] as const;

export type ResourceTab = (typeof RESOURCE_TABS)[number]['value'];

export function parseTab(value: string | null): ResourceTab {
	return RESOURCE_TABS.find((tab) => tab.value === value)?.value ?? 'accounts';
}
