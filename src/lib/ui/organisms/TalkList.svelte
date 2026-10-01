<script lang="ts">
	import Avatar from '../atoms/Avatar.svelte';
	import RichText from '../molecules/RichText.svelte';
	import type { RefView, TalkMessage } from '../types';

	interface Props {
		messages: TalkMessage[];
		resolve: (ref: string) => RefView | undefined;
		personName: (userId: string) => string | undefined;
	}

	/** A short conversation about one element, oldest first, like comments. */
	let { messages, resolve, personName }: Props = $props();
</script>

<ol class="flex flex-col gap-4">
	{#each messages as message (message.id)}
		<li class="flex gap-2.5 {message.pending ? 'opacity-55' : ''}">
			<Avatar name={message.author.name} color={message.author.color} size={24} />
			<div class="min-w-0 flex-1">
				<p class="flex items-baseline gap-2 text-xs text-ink-3">
					<span class="text-ui font-medium text-ink">{message.author.name}</span>{message.when}
					{#if message.thread}<a href={message.href} class="ml-auto hover:text-ink"
							>dans {message.thread}</a
						>{/if}
				</p>
				<RichText
					text={message.body}
					{resolve}
					{personName}
					class="mt-0.5 text-sm leading-relaxed"
				/>
			</div>
		</li>
	{/each}
</ol>
