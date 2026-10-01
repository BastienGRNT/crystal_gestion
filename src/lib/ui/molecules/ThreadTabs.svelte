<script lang="ts">
	import { Hash } from '@lucide/svelte';
	import type { ThreadLink } from '../discussion';

	let { threads }: { threads: ThreadLink[] } = $props();
</script>

<nav
	aria-label="Fils de discussion"
	class="-mx-4 flex [scrollbar-width:none] gap-1.5 overflow-x-auto px-4 pb-1"
>
	{#each threads as thread (thread.key)}
		<a
			href={thread.href}
			aria-current={thread.active ? 'page' : undefined}
			class="inline-flex h-8 max-w-52 shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm transition {thread.active
				? 'border-ink bg-ink font-medium text-bg'
				: 'border-line bg-surface text-ink-2'}"
		>
			{#if thread.color}<span class="size-2 rounded-[3px]" style="background:{thread.color}"
				></span>{:else}<Hash size={12} />{/if}
			<span class="truncate">{thread.label}</span>
		</a>
	{/each}
</nav>
