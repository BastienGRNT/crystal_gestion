<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { DocEntry } from '../types';

	interface Props {
		/** The table of contents, in reading order. */
		entries: DocEntry[];
		label: string;
		children: Snippet;
	}

	let { entries, label, children }: Props = $props();
</script>

<!-- A document read from top to bottom, its contents always in reach on a wide screen. -->
<div class="grid gap-8 lg:grid-cols-[210px_minmax(0,1fr)]">
	<nav aria-label={label} class="hidden lg:block">
		<ol class="sticky top-6 flex flex-col gap-0.5 text-sm">
			{#each entries as entry (entry.id)}
				<li>
					<a
						href="#{entry.id}"
						class={[
							'flex min-h-9 items-center justify-between gap-2 rounded-lg px-2.5 transition-colors hover:bg-hover',
							entry.tone === 'warn' ? 'text-warn-text' : 'text-ink-2 hover:text-ink'
						]}
					>
						<span class="min-w-0 truncate">{entry.label}</span>
						{#if entry.count}<span class="font-mono text-xs text-ink-3 tabular-nums"
								>{entry.count}</span
							>{/if}
					</a>
				</li>
			{/each}
		</ol>
	</nav>
	<div class="flex max-w-[860px] min-w-0 flex-col gap-12">{@render children()}</div>
</div>
