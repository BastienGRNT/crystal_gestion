<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { MessageHandlers, MessageView } from '../discussion';
	import type { RefView } from '../types';
	import AskBar from '../molecules/AskBar.svelte';
	import DayDivider from '../molecules/DayDivider.svelte';
	import MessageActions from '../molecules/MessageActions.svelte';
	import MessageFooter from '../molecules/MessageFooter.svelte';
	import MessageGutter from '../molecules/MessageGutter.svelte';
	import MessageHeader from '../molecules/MessageHeader.svelte';
	import ReplyQuote from '../molecules/ReplyQuote.svelte';
	import RichText from '../molecules/RichText.svelte';

	interface Props extends MessageHandlers {
		view: MessageView;
		resolve: (ref: string) => RefView | undefined;
		personName: (userId: string) => string | undefined;
		highlighted?: boolean;
		/** Replaces the body while the author edits the message. */
		editor?: Snippet;
	}

	let { view, resolve, personName, highlighted = false, editor, ...on }: Props = $props();
</script>

{#if view.day}<DayDivider label={view.day} />{/if}
<article
	id={view.ref}
	class="group relative flex scroll-mt-24 gap-3 px-4 transition-colors duration-700 sm:px-6
	{view.compact ? 'py-0.5' : 'pt-3 pb-0.5'}
	{highlighted
		? 'bg-accent-soft shadow-[inset_2px_0_0_var(--accent)]'
		: 'hover:bg-surface/70'} {view.pending ? 'opacity-55' : ''}"
>
	<MessageGutter {view} />
	<div class="min-w-0 flex-1 pb-1.5">
		{#if !view.compact}<MessageHeader {view} />{/if}
		{#if view.replyTo}<ReplyQuote {...view.replyTo} onjump={on.onjump} />{/if}
		{#if editor}{@render editor()}{:else}
			<RichText
				text={view.body}
				{resolve}
				{personName}
				class="max-w-[72ch] text-base leading-[1.55]"
			/>
		{/if}
		<MessageFooter {view} />
		{#if view.askedToMe && !editor}
			<AskBar author={view.authorName} onreply={on.onreply} onresolve={on.onresolve} />
		{/if}
		{#if !view.pending && !editor}<MessageActions {view} {...on} />{/if}
	</div>
</article>
