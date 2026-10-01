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
	class="fixed inset-0 z-40 flex animate-slide-in flex-col bg-panel shadow-pop sm:inset-y-2 sm:right-2 sm:left-auto sm:w-[480px] sm:rounded-xl sm:border sm:border-line"
	aria-label="Aperçu"
>
	<header class="flex h-[52px] shrink-0 items-center gap-2 border-b border-line pr-2.5 pl-[18px]">
		<div class="min-w-0 flex-1">{@render header()}</div>
		<IconButton label="Fermer (Échap)" onclick={onclose}><X size={16} /></IconButton>
	</header>
	<div class="flex-1 overflow-y-auto px-5 pt-[18px] pb-6">{@render children()}</div>
</aside>
