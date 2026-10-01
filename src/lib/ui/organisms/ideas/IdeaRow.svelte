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
	class="group relative flex min-h-[52px] animate-rise items-center gap-3.5 px-5 hover:bg-hover {idea.draft
		? 'opacity-60'
		: ''}"
>
	<Lightbulb size={20} class="shrink-0 {idea.untriaged ? 'text-should' : 'text-ink-3'}" />
	<button
		type="button"
		onclick={onopen}
		class="flex min-w-0 flex-1 items-baseline gap-3 text-left after:absolute after:inset-0 after:content-['']"
	>
		<span class="truncate text-[15px] {idea.archived ? 'text-ink-3' : ''}">{idea.title}</span>
		{#if idea.note}<span class="hidden truncate text-ui text-ink-3 md:inline">{idea.note}</span
			>{/if}
	</button>
	<span class="relative opacity-0 group-hover:opacity-100 max-sm:opacity-100"
		><IdeaActions archived={idea.archived} {...handlers} /></span
	>
	<span class="shrink-0 text-ui whitespace-nowrap text-ink-3">{timeAgo(idea.createdAt)}</span>
	{#if idea.author}<span class="relative" title={idea.author.name}
			><Avatar name={idea.author.name} color={idea.author.color} size={26} /></span
		>{/if}
</div>
