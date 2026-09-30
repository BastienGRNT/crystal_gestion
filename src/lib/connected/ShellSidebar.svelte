<script lang="ts">
	import { page } from '$app/state';
	import { useProject } from '$lib/client/context';
	import { activeNav, navSections } from '$lib/client/navigation';
	import { overlays } from '$lib/client/overlays.svelte';
	import { theme } from '$lib/client/theme.svelte';
	import { needsTriage } from '$lib/modules/ideas/domain/idea';
	import Sidebar from '$lib/ui/organisms/Sidebar.svelte';
	import SidebarFooter from '$lib/ui/organisms/SidebarFooter.svelte';
	import ActiveTimer from './ActiveTimer.svelte';

	let { projects }: { projects: { slug: string; name: string }[] } = $props();
	const { store, me } = useProject();
	const online = $derived(store.members.items.filter((member) => store.online.includes(member.id)));
	const unread = $derived(store.notifications.items.filter((n) => !n.readAt).length);
	const sections = $derived(
		navSections(store.project.slug, { ideas: store.ideas.items.filter(needsTriage).length })
	);
</script>

<Sidebar
	project={store.project}
	{projects}
	active={activeNav(page.url.pathname, store.project.slug)}
	{sections}
	onsearch={() => overlays.openPalette()}
	onidea={() => overlays.openIdea()}
>
	{#snippet timer()}<ActiveTimer />{/snippet}
	{#snippet footer()}
		<SidebarFooter
			{me}
			{online}
			{unread}
			themeMode={theme.mode}
			ontheme={() => theme.cycle()}
			onnotifications={() => (overlays.notifications = true)}
		/>
	{/snippet}
</Sidebar>
