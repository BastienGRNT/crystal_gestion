<script lang="ts">
	import type { ElementSummary } from '$lib/modules/kernel/domain/element';
	import Backlinks from '../Backlinks.svelte';

	let { element }: { element: ElementSummary } = $props();
</script>

<h2 class="font-display text-[30px] leading-tight">{element.title}</h2>
<div class="mt-6 border-t border-line pt-5"><Backlinks id={element.id} /></div>
