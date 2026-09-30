<script lang="ts">
	import type { MessageView } from '../discussion';
	import QuestionBadge from './QuestionBadge.svelte';
	import RefChip from './RefChip.svelte';

	let { view }: { view: MessageView } = $props();
	// The reader's own pending answer is shown by the ask bar instead.
	const badge = $derived(view.isQuestion && (view.waitingOn.length > 0 || !view.askedToMe));
</script>

{#if badge || view.links.length}
	<div class="mt-1.5 flex flex-wrap items-center gap-1.5 text-sm">
		{#if badge}<QuestionBadge waitingOn={view.waitingOn} />{/if}
		{#each view.links as link (link.ref)}
			<span class="inline-flex items-center gap-1 text-ink-3"
				>→ <RefChip view={link} fallback={link.ref} /></span
			>
		{/each}
	</div>
{/if}
