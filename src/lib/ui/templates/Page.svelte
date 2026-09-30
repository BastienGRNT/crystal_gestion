<script lang="ts">
	import type { Snippet } from 'svelte';

	let { width = 'max-w-5xl', children }: { width?: string; children: Snippet } = $props();
</script>

<div class="mx-auto w-full {width} px-4 pt-8 pb-28 sm:px-8 sm:pt-12 md:pb-16">
	{@render children()}
</div>
