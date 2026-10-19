<script lang="ts">
	import { parseMessage, type Inline } from '$lib/client/rich-text';

	interface Props {
		body: string;
		meId?: string;
		nameOf?: (userId: string) => string;
		/** Resolves `#12` inside the channel's project, when it has one. */
		taskOf?: (number: number) => { id: string; title: string } | undefined;
		onopentask?: (id: string) => void;
		/** Smaller text, for a note under a title. */
		size?: 'md' | 'base';
	}

	let {
		body,
		meId = '',
		nameOf = () => 'quelqu’un',
		taskOf = () => undefined,
		onopentask = () => {},
		size = 'md'
	}: Props = $props();
	const blocks = $derived(parseMessage(body));
</script>

{#snippet inline(pieces: Inline[])}
	{#each pieces as piece, i (i)}
		{#if piece.type === 'text'}{piece.text}{:else if piece.type === 'break'}<br
			/>{:else if piece.type === 'code'}<code
				class="rounded-md bg-sunken px-1.5 py-0.5 font-mono text-[0.86em]">{piece.text}</code
			>{:else if piece.type === 'bold'}<strong class="font-semibold">{piece.text}</strong
			>{:else if piece.type === 'link'}<a
				href={piece.href}
				target="_blank"
				rel="noopener noreferrer"
				class="break-all text-accent-text underline decoration-accent/30 underline-offset-2 hover:decoration-accent"
				>{piece.text}</a
			>{:else if piece.type === 'mention'}<span
				class={[
					'rounded-md px-1 font-medium',
					piece.userId === meId ? 'bg-accent text-accent-ink' : 'bg-accent-soft text-accent-text'
				]}>@{nameOf(piece.userId)}</span
			>{:else if piece.type === 'task'}{@const task = taskOf(piece.number)}{#if task}<button
					class="inline rounded-md border border-line bg-surface-2 px-1.5 text-[0.93em] font-medium hover:border-accent hover:text-accent-text"
					onclick={() => onopentask(task.id)}
					title={task.title}
					><span class="font-mono text-ink-3">#{piece.number}</span>
					{task.title.length > 48 ? `${task.title.slice(0, 47)}…` : task.title}</button
				>{:else}#{piece.number}{/if}{/if}
	{/each}
{/snippet}

<div
	class={[
		'flex flex-col gap-1.5 leading-relaxed break-words text-ink',
		size === 'md' ? 'text-md' : 'text-base'
	]}
>
	{#each blocks as block, i (i)}
		{#if block.type === 'paragraph'}
			<p>{@render inline(block.inlines)}</p>
		{:else if block.type === 'heading'}
			<p
				class={[
					'font-semibold tracking-tight first:mt-0',
					block.level === 1 ? 'mt-2 text-lg text-ink' : 'mt-1 text-ink',
					block.level === 3 && 'text-ink-2'
				]}
			>
				{@render inline(block.inlines)}
			</p>
		{:else if block.type === 'list'}
			<svelte:element
				this={block.ordered ? 'ol' : 'ul'}
				class={['flex flex-col gap-0.5 pl-5', block.ordered ? 'list-decimal' : 'list-disc']}
			>
				{#each block.items as item, j (j)}<li class="pl-0.5 marker:text-ink-3">
						{@render inline(item)}
					</li>{/each}
			</svelte:element>
		{:else if block.type === 'quote'}
			<blockquote class="border-l-[3px] border-line-strong pl-3 text-ink-2">
				{@render inline(block.inlines)}
			</blockquote>
		{:else}
			<pre
				class="scrollbar-thin overflow-x-auto rounded-lg border border-line bg-sunken px-3 py-2 font-mono text-sm leading-relaxed"><code
					>{block.text}</code
				></pre>
		{/if}
	{/each}
</div>
