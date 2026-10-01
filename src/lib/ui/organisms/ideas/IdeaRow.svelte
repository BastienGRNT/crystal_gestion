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
	class="group flex min-h-[52px] animate-rise flex-col gap-1 border-b border-line py-2 pr-2 pl-3.5 last:border-b-0 sm:flex-row sm:items-center {idea.draft
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
			class="mt-[7px] size-1.5 shrink-0 rounded-full {idea.untriaged
				? 'bg-should'
				: 'bg-line-strong'}"
			title={idea.untriaged ? 'À trier' : 'Gardée'}
		></span>
		<div class="min-w-0 flex-1">
			<p class="leading-snug font-medium {idea.archived ? 'text-ink-3 line-through' : ''}">
				{idea.title}
			</p>
			{#if idea.note}<RichText
					text={idea.note}
					{resolve}
					{personName}
					class="mt-0.5 line-clamp-2 text-sm text-ink-3"
				/>{/if}
			<IdeaMeta {idea} />
		</div>
	</div>
	<div class="pl-[18px] sm:pl-0">
		<IdeaActions archived={idea.archived} untriaged={idea.untriaged} {...handlers} />
	</div>
</li>
