<script lang="ts">
	import type { Snippet } from 'svelte';
	import { X } from '@lucide/svelte';
	import IconButton from '../atoms/IconButton.svelte';

	interface Props {
		header: Snippet;
		children: Snippet;
		onclose: () => void;
	}

	let { header, children, onclose }: Props = $props();
</script>

<svelte:window
	onkeydown={(event) =>
		event.key === 'Escape' &&
		!(event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLInputElement) &&
		onclose()}
/>

<div
	class="fixed inset-0 z-40 bg-overlay md:bg-transparent"
	role="presentation"
	onclick={onclose}
></div>
<!-- Floats over the page card so the list behind stays readable. -->
<aside
	class="fixed inset-0 z-40 flex animate-slide-in flex-col bg-surface shadow-pop sm:inset-y-3 sm:right-3 sm:left-auto sm:w-[560px] sm:rounded-[22px]"
	aria-label="Aperçu"
>
	<header class="flex h-14 shrink-0 items-center gap-2 border-b-[1.5px] border-line pr-3 pl-7">
		<div class="min-w-0 flex-1">{@render header()}</div>
		<IconButton label="Fermer (Échap)" onclick={onclose}><X size={16} /></IconButton>
	</header>
	<div class="flex-1 overflow-y-auto px-7 pt-6 pb-8">{@render children()}</div>
</aside>
