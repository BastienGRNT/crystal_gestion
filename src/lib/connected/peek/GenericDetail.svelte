<script lang="ts">
	import { ArrowUpRight } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import { elementHref } from '$lib/client/refs/kinds';
	import type { ElementSummary } from '$lib/modules/kernel/domain/element';
	import Backlinks from '../Backlinks.svelte';

	let { element }: { element: ElementSummary } = $props();
	const { store } = useProject();
	const href = $derived(elementHref(store.project.slug, element));
	const label = $derived(element.kind === 'message' ? 'Voir dans la discussion' : 'Ouvrir la page');
</script>

<h2 class="font-display text-[30px] leading-tight">{element.title}</h2>
{#if !href.includes('?peek=')}
	<a
		{href}
		class="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-accent hover:underline"
		>{label}<ArrowUpRight size={14} /></a
	>
{/if}
<div class="mt-6 border-t border-line pt-5"><Backlinks id={element.id} /></div>
