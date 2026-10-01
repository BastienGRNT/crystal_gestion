<script lang="ts">
	import { Hash } from '@lucide/svelte';
	import type { ThreadLink } from '../discussion';
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
		class="flex h-10 items-center gap-3 rounded-[10px] px-3 text-[15px] transition hover:no-underline {thread.channel
			? 'ml-5'
			: ''} {thread.active
			? 'bg-surface font-bold text-ink shadow-card ring-[1.5px] ring-line'
			: 'font-medium text-ink-2 hover:bg-hover hover:text-ink'}"
	>
		{#if thread.color}
			<span class="flex w-3.5 justify-center"
				><span class="size-2.5 rounded-[3px]" style="background:{thread.color}"></span></span
			>
		{:else}<Hash size={14} class="text-ink-3" />{/if}
		<span class="min-w-0 flex-1 truncate">{thread.label}</span>
	</a>
{/snippet}

<nav aria-label="Fils de discussion" class="flex flex-col gap-0.5">
	<p class="mb-1.5 px-3 text-xs font-bold tracking-[0.08em] text-ink-3 uppercase">Toute l’équipe</p>
	{#each team as thread (thread.key)}{@render link(thread)}{/each}
	<div class="ml-4">
		<InlineCreate label="Nouveau canal" placeholder="Nom du canal, puis Entrée" {oncreate} />
	</div>
	{#if features.length}
		<p class="mt-6 mb-1.5 px-3 text-xs font-bold tracking-[0.08em] text-ink-3 uppercase">
			Une discussion par Feat
		</p>
		{#each features as thread (thread.key)}{@render link(thread)}{/each}
	{/if}
</nav>
