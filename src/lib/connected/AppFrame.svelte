<script lang="ts">
	import type { Snippet } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { useProject } from '$lib/client/context';
	import { activeNav, NAVIGATION, projectPath } from '$lib/client/navigation';
	import { overlays } from '$lib/client/overlays.svelte';
	import { createShortcutHandler } from '$lib/client/shortcuts';
	import { theme } from '$lib/client/theme.svelte';
	import { needsTriage } from '$lib/modules/ideas/domain/idea';
	import MobileNav from '$lib/ui/organisms/MobileNav.svelte';
	import Sidebar from '$lib/ui/organisms/Sidebar.svelte';
	import SidebarFooter from '$lib/ui/organisms/SidebarFooter.svelte';
	import ActiveTimer from './ActiveTimer.svelte';
	import CommandCenter from './CommandCenter.svelte';
	import ConnectionBanner from './ConnectionBanner.svelte';
	import NotificationsPanel from './NotificationsPanel.svelte';
	import Peek from './Peek.svelte';
	import QuickIdea from './QuickIdea.svelte';

	let { projects, children }: { projects: { slug: string; name: string }[]; children: Snippet } =
		$props();
	const { store, me } = useProject();
	const slug = $derived(store.project.slug);
	const active = $derived(activeNav(page.url.pathname, slug));
	const online = $derived(store.members.items.filter((member) => store.online.includes(member.id)));
	const unread = $derived(store.notifications.items.filter((n) => !n.readAt).length);
	const badges = $derived({ ideas: store.ideas.items.filter(needsTriage).length });

	const shortcuts = () => ({
		'mod+k': () => overlays.openPalette(),
		i: () => overlays.openIdea(),
		c: () => overlays.openPalette(),
		...Object.fromEntries(
			NAVIGATION.map((item) => [item.shortcut, () => goto(projectPath(slug, item.path))])
		)
	});
</script>

<svelte:window onkeydown={createShortcutHandler(shortcuts)} />

<div class="flex h-dvh overflow-hidden">
	<div class="hidden md:block {overlays.mobileMenu ? 'fixed! inset-y-0 left-0 z-40 block!' : ''}">
		<Sidebar
			project={store.project}
			{projects}
			{active}
			{badges}
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
	</div>
	{#if overlays.mobileMenu}
		<div
			class="fixed inset-0 z-30 bg-ink/20 md:hidden"
			role="presentation"
			onclick={() => (overlays.mobileMenu = false)}
		></div>
	{/if}
	<main
		class="min-w-0 flex-1 overflow-y-auto"
		onclick={() => (overlays.mobileMenu = false)}
		role="presentation"
	>
		{@render children()}
	</main>
	<MobileNav {slug} {active} onmenu={() => (overlays.mobileMenu = !overlays.mobileMenu)} />
</div>

<Peek />
<CommandCenter />
<ConnectionBanner />
{#if overlays.idea}<QuickIdea />{/if}
{#if overlays.notifications}<NotificationsPanel />{/if}
