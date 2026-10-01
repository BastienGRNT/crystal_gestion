<script lang="ts">
	import type { Snippet } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { appShortcuts } from '$lib/client/app-shortcuts';
	import { useProject } from '$lib/client/context';
	import { createSeed } from '$lib/client/create-context';
	import { activeNav, navEntries } from '$lib/client/navigation';
	import { overlays } from '$lib/client/overlays.svelte';
	import { createShortcutHandler } from '$lib/client/shortcuts';
	import MobileNav from '$lib/ui/organisms/MobileNav.svelte';
	import ActiveTimer from './ActiveTimer.svelte';
	import CommandCenter from './CommandCenter.svelte';
	import ConnectionBanner from './ConnectionBanner.svelte';
	import CreateDialog from './create/CreateDialog.svelte';
	import NotificationsPanel from './NotificationsPanel.svelte';
	import Peek from './Peek.svelte';
	import ShellSidebar from './ShellSidebar.svelte';

	let { projects, children }: { projects: { slug: string; name: string }[]; children: Snippet } =
		$props();
	const { store } = useProject();
	const slug = $derived(store.project.slug);
	const closeMenu = () => (overlays.mobileMenu = false);
	const tabs = $derived(navEntries(slug).slice(0, 4));
	const shortcuts = () => appShortcuts(slug, goto, () => createSeed(page.url, store));
</script>

<svelte:window onkeydown={createShortcutHandler(shortcuts)} />

<div class="flex h-dvh overflow-hidden bg-bg">
	<div class={overlays.mobileMenu ? 'fixed inset-y-0 left-0 z-40 animate-rise' : 'hidden md:block'}>
		<ShellSidebar {projects} />
	</div>
	{#if overlays.mobileMenu}
		<div
			class="fixed inset-0 z-30 bg-overlay md:hidden"
			role="presentation"
			onclick={closeMenu}
		></div>
	{/if}
	<!-- Pages live in a card next to the sidebar; `#page` is the scroll container. -->
	<main class="flex min-w-0 flex-1 md:py-2 md:pr-2">
		<div
			id="page"
			class="relative flex min-w-0 flex-1 flex-col overflow-y-auto bg-panel md:rounded-xl md:border md:border-line"
		>
			{@render children()}
		</div>
	</main>
	<div class="fixed inset-x-3 bottom-[calc(3.75rem+env(safe-area-inset-bottom))] z-30 md:hidden">
		<ActiveTimer />
	</div>
	<MobileNav
		items={tabs}
		active={activeNav(page.url.pathname, slug)}
		onmenu={() => (overlays.mobileMenu = !overlays.mobileMenu)}
	/>
</div>

<Peek />
<CommandCenter />
<ConnectionBanner />
{#if overlays.create}<CreateDialog />{/if}
{#if overlays.notifications}<NotificationsPanel />{/if}
