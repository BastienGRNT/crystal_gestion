<script lang="ts">
	import { page } from '$app/state';
	import { useProject } from '$lib/client/context';
	import AccountsTab from '$lib/connected/resources/AccountsTab.svelte';
	import ContactsTab from '$lib/connected/resources/ContactsTab.svelte';
	import LinksTab from '$lib/connected/resources/LinksTab.svelte';
	import { parseTab, RESOURCE_TABS, type ResourceTab } from '$lib/connected/resources/tabs';
	import { Search } from '@lucide/svelte';
	import { overlays } from '$lib/client/overlays.svelte';
	import HeaderButton from '$lib/ui/molecules/HeaderButton.svelte';
	import LinkSegments from '$lib/ui/molecules/LinkSegments.svelte';
	import Page from '$lib/ui/templates/Page.svelte';
	import PageHeader from '$lib/ui/templates/PageHeader.svelte';

	const { store } = useProject();
	const tab = $derived(parseTab(page.url.searchParams.get('tab')));
	const counts: Record<ResourceTab, () => number> = {
		accounts: () => store.accounts.items.length,
		links: () => store.links.items.length,
		contacts: () => store.contacts.items.length
	};
	const tabs = $derived(
		RESOURCE_TABS.map((t) => ({
			...{ value: t.value, label: 'short' in t ? t.short : t.label },
			...{ href: `?tab=${t.value}`, count: counts[t.value]() }
		}))
	);
</script>

<svelte:head><title>Ressources · {store.project.name}</title></svelte:head>

<PageHeader title="Ressources">
	{#snippet actions()}
		<LinkSegments label="Type de ressource" value={tab} {tabs} />
		<HeaderButton title="Chercher partout (⌘K)" onclick={() => overlays.openPalette()}
			><Search size={14} />Chercher</HeaderButton
		>
	{/snippet}
</PageHeader>
<Page width="max-w-[1100px]">
	<div>
		{#key tab}
			{#if tab === 'accounts'}<AccountsTab />
			{:else if tab === 'links'}<LinksTab />
			{:else}<ContactsTab />{/if}
		{/key}
	</div>
</Page>
