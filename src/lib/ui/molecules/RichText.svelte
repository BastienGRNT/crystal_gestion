<script lang="ts">
	import { tokenize } from '$lib/modules/kernel/domain/refs';
	import { splitMentions } from '$lib/modules/discussion/domain/mentions';
	import type { RefView } from '../types';
	import RefChip from './RefChip.svelte';

	interface Props {
		text: string;
		resolve: (ref: string) => RefView | undefined;
		personName?: (userId: string) => string | undefined;
		class?: string;
	}

	let { text, resolve, personName = () => undefined, class: extra = '' }: Props = $props();
	const URL_PATTERN = /(https?:\/\/[^\s<]+[^\s<.,;:!?)])/g;
</script>

<div class="break-words whitespace-pre-wrap {extra}">
	{#each tokenize(text) as token, index (index)}
		{#if token.type === 'ref'}
			<RefChip view={resolve(token.ref)} fallback={token.ref} />
		{:else}
			{#each splitMentions(token.value) as part, partIndex (partIndex)}
				{#if part.type === 'mention'}
					<span class="rounded-[5px] bg-should/15 px-1 font-medium text-ink"
						>@{personName(part.userId) ?? 'quelqu’un'}</span
					>
				{:else}
					{#each part.value.split(URL_PATTERN) as chunk, chunkIndex (chunkIndex)}
						{#if chunkIndex % 2 === 1}
							<a
								href={chunk}
								target="_blank"
								rel="noreferrer"
								class="text-accent underline decoration-accent/30 underline-offset-2 hover:decoration-accent"
								>{chunk}</a
							>
						{:else}{chunk}{/if}
					{/each}
				{/if}
			{/each}
		{/if}
	{/each}
</div>
