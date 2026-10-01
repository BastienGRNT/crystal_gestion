<script lang="ts">
	import { page } from '$app/state';
	import { useProject } from '$lib/client/context';
	import { activeNav, navEntries, projectPath, SUB_PAGES } from '$lib/client/navigation';
	import { overlays } from '$lib/client/overlays.svelte';
	import { theme } from '$lib/client/theme.svelte';
	import { defaultCreateKind } from '$lib/client/create-context';
	import { sidebarFeatures } from '$lib/client/views/sidebar-features';
	import Sidebar from '$lib/ui/organisms/Sidebar.svelte';
	import SidebarFooter from '$lib/ui/organisms/SidebarFooter.svelte';
	import ActiveTimer from './ActiveTimer.svelte';

	let { projects }: { projects: { slug: string; name: string }[] } = $props();
	const { store, me } = useProject();
	const slug = $derived(store.project.slug);
	const online = $derived(store.members.items.filter((member) => store.online.includes(member.id)));
	const unread = $derived(store.notifications.items.filter((n) => !n.readAt).length);
	const questions = $derived(
		store.questions.items.filter((q) => !q.resolvedAt && q.userId === me.id).length
	);
	const entries = $derived(navEntries(slug, { discussion: questions }));
	const features = $derived(
		sidebarFeatures(store.features.items, store.tasks.items, slug, page.url.pathname)
	);
	const projectLinks = $derived(
		SUB_PAGES.filter((sub) => sub.key !== 'features').map((sub) => ({
			label: sub.label,
			href: projectPath(slug, sub.path),
			icon: sub.icon
		}))
	);
</script>

<Sidebar
	project={store.project}
	{projects}
	{projectLinks}
	active={activeNav(page.url.pathname, slug)}
	{entries}
	{features}
	oncreate={() => overlays.openCreate(...defaultCreateKind(page.url, store))}
	onfeature={() => overlays.openCreate('feature')}
	onsearch={() => overlays.openPalette()}
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
