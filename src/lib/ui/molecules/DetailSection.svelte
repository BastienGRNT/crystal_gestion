<script lang="ts">
	import type { Snippet } from 'svelte';

	let { label, children }: { label: string; children: Snippet } = $props();
</script>

<section class="border-t border-line pt-5">
	<h3 class="mb-2 text-xs font-medium tracking-wide text-ink-3 uppercase">{label}</h3>
	{@render children()}
</section>
