<script lang="ts">
	import { Hash } from '@lucide/svelte';
	import type { ThreadLink } from '../discussion';
	import PriorityDot from '../atoms/PriorityDot.svelte';
	import InlineCreate from './InlineCreate.svelte';

	interface Props {
		team: ThreadLink[];
		features: ThreadLink[];
		oncreate: (name: string) => void;
	}

	let { team, features, oncreate }: Props = $props();
</script>

{#snippet link(thread: ThreadLink)}
	<a
		href={thread.href}
		aria-current={thread.active ? 'page' : undefined}
		class="flex h-[34px] items-center gap-2.5 rounded-lg px-2.5 text-sm transition hover:no-underline {thread.channel
			? 'ml-4'
			: ''} {thread.active ? 'bg-hover font-semibold text-ink' : 'text-ink hover:bg-hover'}"
	>
		{#if thread.priority}
			<span class="flex w-3.5 justify-center"><PriorityDot priority={thread.priority} /></span>
		{:else}<Hash size={14} class="text-ink-3" />{/if}
		<span class="min-w-0 flex-1 truncate">{thread.label}</span>
		{#if thread.ref}<span class="font-mono text-2xs text-ink-3">{thread.ref}</span>{/if}
	</a>
{/snippet}

<nav aria-label="Fils de discussion" class="flex flex-col gap-px">
	{#each team as thread (thread.key)}{@render link(thread)}{/each}
	<div class="ml-4">
		<InlineCreate label="Nouveau canal" placeholder="Nom du canal, puis Entrée" {oncreate} />
	</div>
	{#if features.length}
		<p class="mt-4 mb-1 px-2.5 text-2xs font-semibold tracking-[0.04em] text-ink-3 uppercase">
			Features
		</p>
		{#each features as thread (thread.key)}{@render link(thread)}{/each}
	{/if}
</nav>
