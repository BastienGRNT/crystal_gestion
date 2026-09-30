<script lang="ts">
	import type { Snippet } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { appShortcuts } from '$lib/client/app-shortcuts';
	import { useProject } from '$lib/client/context';
	import { activeNav } from '$lib/client/navigation';
	import { overlays } from '$lib/client/overlays.svelte';
	import { createShortcutHandler } from '$lib/client/shortcuts';
	import MobileNav from '$lib/ui/organisms/MobileNav.svelte';
	import ActiveTimer from './ActiveTimer.svelte';
	import CommandCenter from './CommandCenter.svelte';
	import ConnectionBanner from './ConnectionBanner.svelte';
	import NotificationsPanel from './NotificationsPanel.svelte';
	import Peek from './Peek.svelte';
	import QuickIdea from './QuickIdea.svelte';
	import ShellSidebar from './ShellSidebar.svelte';

	let { projects, children }: { projects: { slug: string; name: string }[]; children: Snippet } =
		$props();
	const { store } = useProject();
	const slug = $derived(store.project.slug);
	const closeMenu = () => (overlays.mobileMenu = false);
</script>

<svelte:window onkeydown={createShortcutHandler(() => appShortcuts(slug, goto))} />

<div class="flex h-dvh overflow-hidden">
	<div class={overlays.mobileMenu ? 'fixed inset-y-0 left-0 z-40 animate-rise' : 'hidden md:block'}>
		<ShellSidebar {projects} />
	</div>
	{#if overlays.mobileMenu}
		<div
			class="fixed inset-0 z-30 bg-ink/20 md:hidden"
			role="presentation"
			onclick={closeMenu}
		></div>
	{/if}
	<main class="min-w-0 flex-1 overflow-y-auto">{@render children()}</main>
	<div class="fixed inset-x-3 bottom-[calc(3.75rem+env(safe-area-inset-bottom))] z-30 md:hidden">
		<ActiveTimer />
	</div>
	<MobileNav
		{slug}
		active={activeNav(page.url.pathname, slug)}
		onmenu={() => (overlays.mobileMenu = !overlays.mobileMenu)}
	/>
</div>

<Peek />
<CommandCenter />
<ConnectionBanner />
{#if overlays.idea}<QuickIdea />{/if}
{#if overlays.notifications}<NotificationsPanel />{/if}
