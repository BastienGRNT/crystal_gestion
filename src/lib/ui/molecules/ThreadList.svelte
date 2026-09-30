<script lang="ts">
	import { Hash } from '@lucide/svelte';
	import type { ThreadLink } from '../discussion';
	import PriorityDot from '../atoms/PriorityDot.svelte';

	let { threads }: { threads: ThreadLink[] } = $props();
</script>

<nav aria-label="Fils de discussion" class="flex flex-col gap-px">
	{#each threads as thread, index (thread.key)}
		{#if index === 1}
			<p class="mt-5 mb-1.5 px-2.5 font-mono text-[10.5px] tracking-[0.14em] text-ink-3 uppercase">
				Features
			</p>
		{/if}
		<a
			href={thread.href}
			aria-current={thread.active ? 'page' : undefined}
			class="flex h-8 items-center gap-2.5 rounded-md px-2.5 text-[13px] transition {thread.active
				? 'bg-surface font-medium text-ink shadow-sm ring-1 ring-line'
				: 'text-ink-2 hover:bg-sunken hover:text-ink'}"
		>
			{#if thread.priority}
				<span class="flex w-3.5 justify-center"><PriorityDot priority={thread.priority} /></span>
			{:else}<Hash size={14} class="text-ink-3" />{/if}
			<span class="min-w-0 flex-1 truncate">{thread.label}</span>
			{#if thread.ref}<span class="font-mono text-[10.5px] text-ink-3">{thread.ref}</span>{/if}
		</a>
	{/each}
</nav>
