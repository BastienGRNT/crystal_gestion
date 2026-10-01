<script lang="ts">
	import type { Snippet } from 'svelte';

	let { width = 'max-w-[1240px]', children }: { width?: string; children: Snippet } = $props();
</script>

<div class="w-full {width} px-12 pt-7 pb-32 max-lg:px-8 max-md:px-5 max-md:pt-5 md:pb-14">
	{@render children()}
</div>
