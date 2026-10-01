<script lang="ts">
	import { Lightbulb } from '@lucide/svelte';
	import { timeAgo } from '$lib/client/format';
	import type { IdeaView } from '$lib/client/views/idea-card';
	import Avatar from '../../atoms/Avatar.svelte';
	import IdeaActions from './IdeaActions.svelte';
	import type { IdeaHandlers } from './handlers';

	interface Props {
		idea: IdeaView;
		onopen: () => void;
		handlers: IdeaHandlers;
	}

	let { idea, onopen, handlers }: Props = $props();
</script>

<div
	class="group relative flex min-h-10 animate-rise items-center gap-2.5 rounded-lg pr-1 pl-2 hover:bg-hover {idea.draft
		? 'opacity-60'
		: ''}"
>
	<Lightbulb size={15} class="shrink-0 {idea.untriaged ? 'text-should' : 'text-ink-3'}" />
	<button
		type="button"
		onclick={onopen}
		class="flex min-w-0 flex-1 items-baseline gap-2 text-left after:absolute after:inset-0 after:content-['']"
	>
		<span class="truncate text-sm {idea.archived ? 'text-ink-3 line-through' : ''}"
			>{idea.title}</span
		>
		{#if idea.note}<span class="hidden truncate text-xs text-ink-3 md:inline">{idea.note}</span
			>{/if}
	</button>
	<span class="relative opacity-0 group-hover:opacity-100 max-sm:opacity-100"
		><IdeaActions archived={idea.archived} {...handlers} /></span
	>
	<span class="shrink-0 text-right text-xs whitespace-nowrap text-ink-3"
		>{timeAgo(idea.createdAt)}</span
	>
	{#if idea.author}<span class="relative w-6" title={idea.author.name}
			><Avatar name={idea.author.name} color={idea.author.color} size={20} /></span
		>{/if}
</div>
