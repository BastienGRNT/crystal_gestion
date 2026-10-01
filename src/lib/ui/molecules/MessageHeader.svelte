<script lang="ts">
	import type { MessageView } from '../discussion';

	let { view }: { view: MessageView } = $props();
</script>

<header class="flex items-baseline gap-2 leading-tight">
	<span class="truncate text-base font-semibold tracking-tight">{view.authorName}</span>
	<time class="shrink-0 text-xs text-ink-3 tabular-nums" title={view.timestamp}>{view.time}</time>
	{#if view.pending}
		<span class="text-xs text-ink-3">envoi…</span>
	{:else}
		<span class="font-mono text-2xs text-ink-3/70 opacity-0 transition group-hover:opacity-100"
			>{view.ref}</span
		>
	{/if}
	{#if view.edited}<span class="text-xs text-ink-3 italic">modifié</span>{/if}
</header>
