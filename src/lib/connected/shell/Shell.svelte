<script lang="ts">
	import { Menu, Search, WifiOff } from '@lucide/svelte';
	import type { Snippet } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { useApp } from '$lib/client/context';
	import IconButton from '$lib/ui/atoms/IconButton.svelte';
	import Logo from '$lib/ui/atoms/Logo.svelte';
	import Sidebar from './Sidebar.svelte';

	let { children }: { children: Snippet } = $props();
	const { overlays, realtime } = useApp();
	let drawer = $state<HTMLDialogElement>();

	$effect(() => {
		if (!drawer) return;
		if (overlays.sidebar && !drawer.open) drawer.showModal();
		if (!overlays.sidebar && drawer.open) drawer.close();
	});

	afterNavigate(() => (overlays.sidebar = false));
</script>

<div class="flex h-dvh overflow-hidden bg-bg">
	<aside class="hidden w-64 shrink-0 border-r border-line bg-sidebar lg:block" aria-label="Menu">
		<Sidebar />
	</aside>

	<dialog
		bind:this={drawer}
		onclose={() => (overlays.sidebar = false)}
		onclick={(e) => e.target === drawer && drawer?.close()}
		class="m-0 h-dvh max-h-dvh w-[min(84vw,300px)] border-r border-line bg-sidebar p-0 open:animate-pop lg:hidden"
		aria-label="Menu"
	>
		<Sidebar onnavigate={() => (overlays.sidebar = false)} />
	</dialog>

	<div class="flex min-w-0 flex-1 flex-col">
		<header
			class="flex h-14 shrink-0 items-center gap-2 border-b border-line bg-bg/90 px-3 backdrop-blur lg:hidden"
		>
			<IconButton icon={Menu} label="Ouvrir le menu" onclick={() => (overlays.sidebar = true)} />
			<a href="/" class="flex-1"><Logo size={24} /></a>
			<IconButton icon={Search} label="Chercher" onclick={() => (overlays.palette = true)} />
		</header>

		{#if realtime.status === 'offline'}
			<div
				class="flex items-center justify-center gap-2 bg-warn/15 px-4 py-1.5 text-sm text-warn-text"
				role="status"
			>
				<WifiOff size={14} aria-hidden="true" /> Connexion perdue, reconnexion en cours…
			</div>
		{/if}

		<main id="page" class="min-h-0 flex-1 scrollbar-thin overflow-y-auto">
			{@render children()}
		</main>
	</div>
</div>
