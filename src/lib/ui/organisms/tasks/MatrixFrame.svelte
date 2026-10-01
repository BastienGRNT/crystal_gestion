<script lang="ts">
	import type { Snippet } from 'svelte';
	import { soft } from '../../tones';

	interface Props {
		/** Row by row: important & urgent, important, urgent, neither. */
		cells: { key: string; label: string; hint: string; color: string; count: number }[];
		/** The quadrant being dragged over, highlighted. */
		over?: string | null;
		/** What goes inside a quadrant, below its title. */
		quadrant: Snippet<[number]>;
		ondragover?: (event: DragEvent, key: string) => void;
		ondragleave?: (key: string) => void;
		ondrop?: (event: DragEvent, key: string) => void;
	}

	let { cells, over = null, quadrant, ondragover, ondragleave, ondrop }: Props = $props();
	const axis = 'text-xs font-semibold tracking-[0.08em] text-ink-2 uppercase';
	// Inner borders draw the cross; the frame draws the outside.
	const EDGES = ['border-r-2 border-b-2', 'border-b-2', 'border-r-2', ''];
</script>

<!-- A real 2×2 grid: urgency across the top, importance down the side, the cross in the middle. -->
<div
	class="grid grid-cols-[1.75rem_minmax(0,1fr)_minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)_minmax(0,1fr)] overflow-hidden rounded-xl border-2 border-line-strong bg-surface sm:grid-cols-[2.25rem_minmax(0,1fr)_minmax(0,1fr)]"
>
	<span class="border-r-2 border-b-2 border-line-strong bg-sunken"></span>
	<p class="{axis} border-r-2 border-b-2 border-line-strong bg-sunken py-2.5 text-center">Urgent</p>
	<p class="{axis} border-b-2 border-line-strong bg-sunken py-2.5 text-center">Pas urgent</p>
	{#each cells as cell, index (cell.key)}
		{#if index % 2 === 0}
			<div
				class="flex items-center justify-center border-r-2 border-line-strong bg-sunken {index === 0
					? 'border-b-2'
					: ''}"
			>
				<span class="{axis} rotate-180 [writing-mode:vertical-rl]"
					>{index === 0 ? 'Important' : 'Pas important'}</span
				>
			</div>
		{/if}
		<section
			aria-label={cell.label}
			ondragover={(event) => ondragover?.(event, cell.key)}
			ondragleave={() => ondragleave?.(cell.key)}
			ondrop={(event) => ondrop?.(event, cell.key)}
			class="flex min-h-48 min-w-0 flex-col border-line-strong p-2.5 transition sm:p-3 {EDGES[
				index
			]} {over === cell.key ? 'outline-2 -outline-offset-4 outline-accent outline-dashed' : ''}"
			style="background:{soft(cell.color, over === cell.key ? 16 : 6)}"
		>
			<header class="mb-2.5 px-1">
				<div class="flex items-center gap-2">
					<span class="size-2.5 shrink-0 rounded-full" style="background:{cell.color}"></span>
					<h3 class="truncate text-base font-semibold">{cell.label}</h3>
					<span class="ml-auto text-xs text-ink-3">{cell.count || ''}</span>
				</div>
				<p class="mt-0.5 truncate text-xs text-ink-3">{cell.hint}</p>
			</header>
			{@render quadrant(index)}
		</section>
	{/each}
</div>
