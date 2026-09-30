<script lang="ts">
	import type { Suggestion } from '../types';
	import ComposerBar from '../molecules/ComposerBar.svelte';
	import RefTextArea from '../molecules/RefTextArea.svelte';
	import ReplyBanner from '../molecules/ReplyBanner.svelte';

	interface Props {
		value: string;
		question: boolean;
		canAsk: boolean;
		suggest: (symbol: '#' | '@', query: string) => Suggestion[];
		onsubmit: () => void;
		placeholder: string;
		replyingTo?: { author: string; excerpt: string } | null;
		oncancelreply?: () => void;
		element?: HTMLTextAreaElement;
	}

	let {
		value = $bindable(),
		question = $bindable(),
		canAsk,
		suggest,
		onsubmit,
		placeholder,
		replyingTo = null,
		oncancelreply = () => {},
		element = $bindable()
	}: Props = $props();
</script>

<div
	class="rounded-xl border border-line bg-surface shadow-sm transition focus-within:border-line-strong focus-within:shadow-pop"
>
	{#if replyingTo}<ReplyBanner {...replyingTo} oncancel={oncancelreply} />{/if}
	<div class="px-3.5 pt-2.5">
		<RefTextArea
			bind:value
			bind:element
			{suggest}
			{onsubmit}
			oncancel={replyingTo ? oncancelreply : undefined}
			{placeholder}
			suggestions="above"
			rows={1}
			class="max-h-48 min-h-6 text-[14px] leading-[1.55]"
		/>
	</div>
	<ComposerBar
		{question}
		{canAsk}
		canSend={!!value.trim()}
		onquestion={(on) => (question = on)}
		{onsubmit}
	/>
</div>
