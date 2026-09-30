<script lang="ts">
	import { useProject } from '$lib/client/context';
	import { timeAgo } from '$lib/client/format';
	import type { ElementSummary } from '$lib/modules/kernel/domain/element';

	let { element }: { element: ElementSummary } = $props();
	const { refs } = useProject();
	const author = $derived(element.createdBy ? refs.personName(element.createdBy) : undefined);
</script>

<p class="mt-1 text-sm text-ink-3">
	Ajouté {timeAgo(element.createdAt)}{#if author}&nbsp;par {author}{/if}
</p>
