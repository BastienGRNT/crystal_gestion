<script lang="ts">
	import type { IdeaView } from '$lib/client/views/idea-card';
	import RichText from '../../molecules/RichText.svelte';
	import type { RefView } from '../../types';
	import IdeaActions from './IdeaActions.svelte';
	import IdeaMeta from './IdeaMeta.svelte';
	import type { IdeaHandlers } from './handlers';

	interface Props {
		idea: IdeaView;
		resolve: (ref: string) => RefView | undefined;
		personName: (userId: string) => string | undefined;
		onopen: () => void;
		handlers: IdeaHandlers;
	}

	let { idea, resolve, personName, onopen, handlers }: Props = $props();
	const open = (event: Event) => !(event.target as HTMLElement).closest('a') && onopen();
</script>

<li
	class="group flex animate-rise flex-col gap-1 border-b border-line py-3.5 last:border-b-0 sm:flex-row sm:items-start {idea.draft
		? 'opacity-60'
		: ''}"
>
	<div
		role="button"
		tabindex="0"
		onclick={open}
		onkeydown={(e) => e.key === 'Enter' && open(e)}
		class="flex min-w-0 flex-1 gap-3"
	>
		<span
			class="mt-[9px] size-1.5 shrink-0 rounded-full {idea.untriaged
				? 'bg-should'
				: 'bg-line-strong'}"
			title={idea.untriaged ? 'À trier' : 'Gardée'}
		></span>
		<div class="min-w-0 flex-1">
			<p class="text-[15px] leading-snug font-medium {idea.archived ? 'text-ink-3' : ''}">
				{idea.title}
			</p>
			{#if idea.note}<RichText
					text={idea.note}
					{resolve}
					{personName}
					class="mt-0.5 line-clamp-2 text-[13px] text-ink-3"
				/>{/if}
			<IdeaMeta {idea} />
		</div>
	</div>
	<div
		class="pl-2.5 transition sm:pl-0 sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100"
	>
		<IdeaActions archived={idea.archived} {...handlers} />
	</div>
</li>
