<script lang="ts">
	import type { Snippet } from 'svelte';

	let { width = 'max-w-[1240px]', children }: { width?: string; children: Snippet } = $props();
</script>

<div class="mx-auto w-full {width} px-4 pt-6 pb-32 sm:px-8 sm:pt-7 md:pb-12">
	{@render children()}
</div>
