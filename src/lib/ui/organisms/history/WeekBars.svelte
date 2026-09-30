<script lang="ts">
	import type { WeekBar } from './types';

	let { weeks, onpick }: { weeks: WeekBar[]; onpick: (index: number) => void } = $props();
	const max = $derived(Math.max(1, ...weeks.map((week) => week.minutes)));
</script>

<section class="rounded-xl border border-line bg-surface p-4">
	<h3 class="mb-3 text-[12px] font-medium tracking-wide text-ink-3 uppercase">Par semaine</h3>
	<div class="flex h-36 items-end gap-1.5">
		{#each weeks as week, index (week.key)}
			<button
				type="button"
				class="group flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1"
				title="Semaine du {week.label} : {week.value}"
				onclick={() => onpick(index)}
			>
				<span
					class="font-mono text-[10px] text-ink-3 opacity-0 transition group-hover:opacity-100 {week.current
						? 'opacity-100'
						: ''}">{week.value}</span
				>
				<span class="flex min-h-0 w-full flex-1 items-end justify-center">
					<span
						class="w-full max-w-9 rounded-t-[4px] transition {week.current
							? 'bg-accent'
							: 'bg-accent/25 group-hover:bg-accent/45'}"
						style="height:{Math.max(2, (week.minutes / max) * 100)}%"
					></span>
				</span>
				<span class="truncate text-[10.5px] {week.current ? 'text-ink' : 'text-ink-3'}"
					>{week.label}</span
				>
			</button>
		{/each}
	</div>
</section>
