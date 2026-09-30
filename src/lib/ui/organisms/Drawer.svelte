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
	class="fixed inset-0 z-40 bg-ink/10 md:bg-transparent"
	role="presentation"
	onclick={onclose}
></div>
<aside
	class="fixed inset-y-0 right-0 z-40 flex w-full animate-rise flex-col border-l border-line bg-surface shadow-pop sm:w-[500px]"
	aria-label="Aperçu"
>
	<header class="flex items-center gap-2 border-b border-line px-5 py-3">
		<div class="min-w-0 flex-1">{@render header()}</div>
		<IconButton label="Fermer (Échap)" onclick={onclose}><X size={16} /></IconButton>
	</header>
	<div class="flex-1 overflow-y-auto px-5 py-5">{@render children()}</div>
</aside>
