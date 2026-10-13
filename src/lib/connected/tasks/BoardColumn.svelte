<script lang="ts">
	import { ChevronsLeft, ChevronsRight } from '@lucide/svelte';
	import type { Snippet } from 'svelte';
	import { dnd } from '$lib/client/dnd.svelte';

	interface Props {
		title: string;
		count: number;
		/** What this column means for the team, in a few words. */
		hint: string;
		dot: string;
		/** Work-in-progress limit: the header warns past it. */
		limit?: number | null;
		/** Whether one of this column's drop zones is hovered. */
		zones: string[];
		collapsed?: boolean;
		ontoggle?: () => void;
		header?: Snippet;
		children: Snippet;
		footer?: Snippet;
	}

	let {
		title,
		count,
		hint,
		dot,
		limit = null,
		zones,
		collapsed = false,
		ontoggle,
		header,
		children,
		footer
	}: Props = $props();
	const over = $derived(!!dnd.over && zones.includes(dnd.over.zone));
	const tooMuch = $derived(limit !== null && count > limit);
</script>

{#if collapsed}
	<button
		onclick={ontoggle}
		class="flex w-12 shrink-0 flex-col items-center gap-3 rounded-2xl border border-line bg-sunken/70 py-4 text-ink-2 transition-colors hover:border-line-strong hover:text-ink"
		aria-label="Afficher la colonne {title}"
	>
		<ChevronsRight size={16} />
		<span class="text-sm font-semibold [writing-mode:vertical-rl]">{title} · {count}</span>
	</button>
{:else}
	<section
		aria-label={title}
		class={[
			'flex max-h-full w-[85vw] shrink-0 snap-start flex-col rounded-2xl border bg-sunken/70 transition-colors sm:w-[290px] xl:w-auto xl:min-w-[240px] xl:flex-1',
			over ? 'border-accent ring-4 ring-accent-soft' : 'border-transparent'
		]}
	>
		<header
			class={['flex flex-col gap-1 rounded-t-2xl px-3.5 pt-3 pb-2.5', tooMuch && 'bg-warn/15']}
		>
			<div class="flex items-center gap-2">
				<span class={['size-2.5 shrink-0 rounded-full', dot]}></span>
				<h2 class="text-md font-semibold">{title}</h2>
				<span
					class={['text-sm font-semibold tabular-nums', tooMuch ? 'text-warn-text' : 'text-ink-3']}
				>
					{count}{limit !== null ? ` / ${limit}` : ''}
				</span>
				<span class="ml-auto flex items-center">
					{@render header?.()}
					{#if ontoggle}
						<button
							onclick={ontoggle}
							class="flex size-8 items-center justify-center rounded-lg text-ink-3 hover:bg-hover hover:text-ink"
							aria-label="Replier {title}"
						>
							<ChevronsLeft size={16} />
						</button>
					{/if}
				</span>
			</div>
			<p class={['text-sm', tooMuch ? 'font-medium text-warn-text' : 'text-ink-3']}>
				{tooMuch ? 'Trop de choses en même temps : finissez avant de commencer.' : hint}
			</p>
		</header>
		<div data-scroll-y class="min-h-24 flex-1 scrollbar-thin overflow-y-auto px-2.5 pb-2.5">
			{@render children()}
		</div>
		{#if footer}<div class="px-2.5 pb-2.5">{@render footer()}</div>{/if}
	</section>
{/if}
