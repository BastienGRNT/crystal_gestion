<script lang="ts">
	import type { BarRow } from './types';

	let { title, rows, empty }: { title: string; rows: BarRow[]; empty: string } = $props();
	const max = $derived(Math.max(1, ...rows.map((row) => row.minutes)));
</script>

<section class="rounded-xl border border-line bg-surface p-4">
	<h3 class="mb-3 text-xs font-medium tracking-wide text-ink-3 uppercase">{title}</h3>
	{#each rows as row (row.key)}
		<div class="mb-2.5 last:mb-0" title="{row.label} : {row.value}">
			<div class="mb-1 flex items-baseline justify-between gap-3 text-sm">
				<span class="truncate text-ink-2">{row.label}</span>
				<span class="shrink-0 font-mono text-xs text-ink">{row.value}</span>
			</div>
			<div class="h-1.5 rounded-full bg-sunken">
				<div
					class="h-full rounded-full {row.color ? '' : 'bg-accent'}"
					style="width:{(row.minutes / max) * 100}%;{row.color ? `background:${row.color}` : ''}"
				></div>
			</div>
		</div>
	{:else}
		<p class="text-sm text-ink-3">{empty}</p>
	{/each}
</section>
