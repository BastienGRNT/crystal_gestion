<script lang="ts">
	import type { MessageView } from '../discussion';
	import Avatar from '../atoms/Avatar.svelte';

	let { view }: { view: MessageView } = $props();
</script>

<div class="w-8 shrink-0">
	{#if view.compact}
		<time
			class="hidden pt-[3px] font-mono text-[10px] text-ink-3 group-hover:block"
			title={view.timestamp}>{view.time}</time
		>
	{:else}<Avatar name={view.authorName} color={view.authorColor} size={32} />{/if}
</div>
