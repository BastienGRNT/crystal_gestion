<script lang="ts">
	import { page } from '$app/state';
	import { useProject } from '$lib/client/context';
	import AccountsTab from '$lib/connected/resources/AccountsTab.svelte';
	import ContactsTab from '$lib/connected/resources/ContactsTab.svelte';
	import FilesTab from '$lib/connected/resources/FilesTab.svelte';
	import LinksTab from '$lib/connected/resources/LinksTab.svelte';
	import { parseTab, RESOURCE_TABS, type ResourceTab } from '$lib/connected/resources/tabs';
	import Tabs from '$lib/ui/molecules/Tabs.svelte';
	import Page from '$lib/ui/templates/Page.svelte';
	import PageHeader from '$lib/ui/templates/PageHeader.svelte';

	const { store } = useProject();
	const tab = $derived(parseTab(page.url.searchParams.get('tab')));
	const counts: Record<ResourceTab, () => number> = {
		accounts: () => store.accounts.items.length,
		links: () => store.links.items.length,
		contacts: () => store.contacts.items.length,
		files: () => store.files.items.length
	};
	const tabs = $derived(
		RESOURCE_TABS.map((t) => ({ ...t, href: `?tab=${t.value}`, count: counts[t.value]() }))
	);
</script>

<svelte:head><title>Ressources · {store.project.name}</title></svelte:head>

<Page>
	<PageHeader
		eyebrow="Le projet"
		title="Ressources"
		subtitle="Les accès, liens, contacts et fichiers dont l’équipe a besoin, au même endroit. Cmd+K les retrouve aussi."
	/>
	<Tabs label="Type de ressource" value={tab} {tabs} />
	<div class="mt-6">
		{#key tab}
			{#if tab === 'accounts'}<AccountsTab />
			{:else if tab === 'links'}<LinksTab />
			{:else if tab === 'contacts'}<ContactsTab />
			{:else}<FilesTab />{/if}
		{/key}
	</div>
</Page>
