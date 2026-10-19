<script lang="ts">
	import type { TimelineStep } from '../types';

	interface Props {
		steps: TimelineStep[];
	}

	let { steps }: Props = $props();
	// Past four steps, a phone has no room for them side by side: they stack.
	const stacked = $derived(steps.length > 4);
	const fills = { done: 'bg-ok', current: 'bg-accent', late: 'bg-danger', upcoming: 'bg-ink-4' };
	const titles = {
		done: 'text-ink-3',
		current: 'text-ink font-semibold',
		late: 'text-danger-text font-semibold',
		upcoming: 'text-ink-2'
	};
</script>

<!-- Equal segments, not a time scale: what reads is the order and where each one stands. -->
<ol class={['flex gap-2', stacked ? 'flex-col sm:flex-row' : 'flex-row']}>
	{#each steps as step, i (step.id)}
		<li class="min-w-0 flex-1">
			<a
				href="#etape-{step.id}"
				class={[
					'flex rounded-lg p-1.5 hover:bg-hover',
					stacked
						? 'flex-row items-center gap-3 sm:flex-col sm:items-stretch sm:gap-1.5'
						: 'flex-col gap-1.5'
				]}
			>
				<span
					class={[
						'relative h-2 shrink-0 overflow-hidden rounded-full bg-sunken',
						stacked ? 'w-16 sm:w-auto' : ''
					]}
					aria-hidden="true"
				>
					<span
						class={['absolute inset-y-0 left-0 rounded-full', fills[step.tone]]}
						style:width="{Math.round(step.progress * 100)}%"
					></span>
				</span>
				<span class="min-w-0">
					<span class={['block truncate text-sm', titles[step.tone]]}
						><span class="text-ink-4">{i + 1}.</span> {step.title}</span
					>
					{#if step.date}<span class="block truncate text-xs text-ink-3">{step.date}</span>{/if}
					{#if step.sub}<span
							class={[
								'block truncate text-xs font-medium',
								step.tone === 'late' ? 'text-danger-text' : 'text-ink-3'
							]}>{step.sub}</span
						>{/if}
				</span>
			</a>
		</li>
	{/each}
</ol>
