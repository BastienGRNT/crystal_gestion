<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		text,
		id,
		children
	}: { title: string; text?: string; id?: string; children: Snippet } = $props();
</script>

<section {id} class="grid gap-4 border-t border-line py-8 md:grid-cols-[260px_minmax(0,1fr)]">
	<div>
		<h2 class="text-lg font-semibold">{title}</h2>
		{#if text}<p class="mt-1 text-base text-ink-3">{text}</p>{/if}
	</div>
	<div class="rounded-2xl border border-line bg-surface p-6 shadow-card">{@render children()}</div>
</section>
