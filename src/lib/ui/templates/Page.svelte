<script lang="ts">
	import type { Snippet } from 'svelte';

	let { width = 'max-w-[1480px]', children }: { width?: string; children: Snippet } = $props();
</script>

<div class="mx-auto w-full {width} px-4 pt-6 pb-32 sm:px-6 sm:pt-8 md:pb-16 lg:px-10">
	{@render children()}
</div>
