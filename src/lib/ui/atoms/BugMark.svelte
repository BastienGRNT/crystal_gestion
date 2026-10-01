<script lang="ts">
	import { Bug } from '@lucide/svelte';

	let { size = 14 }: { size?: number } = $props();
</script>

<span class="inline-flex shrink-0 text-must" title="Bug" aria-label="Bug"><Bug {size} /></span>
