<script lang="ts">
	import type { MessageView } from '../discussion';

	let { view }: { view: MessageView } = $props();
</script>

<header class="flex items-baseline gap-2 leading-tight">
	<span class="truncate text-[13.5px] font-semibold tracking-tight">{view.authorName}</span>
	<time class="shrink-0 text-[11.5px] text-ink-3 tabular-nums" title={view.timestamp}
		>{view.time}</time
	>
	{#if view.pending}
		<span class="text-[11.5px] text-ink-3">envoi…</span>
	{:else}
		<span class="font-mono text-[10.5px] text-ink-3/70">{view.ref}</span>
	{/if}
	{#if view.edited}<span class="text-[11.5px] text-ink-3 italic">modifié</span>{/if}
</header>
