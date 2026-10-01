<script lang="ts">
	import type { Snippet } from 'svelte';
	import { ArrowRight } from '@lucide/svelte';
	import ReviewStepper from '$lib/ui/organisms/review/ReviewStepper.svelte';

	interface Props {
		steps: { label: string; hint: string; title: string; clear: boolean }[];
		/** One panel per step; all stay mounted so their counts are known from the start. */
		panels: Snippet[];
		finishLabel: string;
		onfinish: () => void;
	}

	let { steps, panels, finishLabel, onfinish }: Props = $props();
	let step = $state(0);
	const last = $derived(step === steps.length - 1);
</script>

<div class="grid items-start gap-7 md:grid-cols-[230px_minmax(0,1fr)]">
	<ReviewStepper {steps} current={step} onpick={(i) => (step = i)} />
	<div class="flex min-w-0 flex-col gap-4">
		<h2 class="text-xl font-semibold tracking-[-0.01em]">{steps[step].title}</h2>
		{#each panels as panel, i (i)}<div class:hidden={step !== i}>{@render panel()}</div>{/each}
		<div class="mt-2 flex justify-between">
			{#if step > 0}
				<button
					type="button"
					onclick={() => (step -= 1)}
					class="h-9 rounded-lg border border-line px-3.5 text-sm font-medium hover:bg-hover"
					>Précédent</button
				>
			{:else}<span></span>{/if}
			<button
				type="button"
				onclick={() => (last ? onfinish() : (step += 1))}
				class="inline-flex h-9 items-center gap-1.5 rounded-lg bg-accent px-4 text-sm font-medium text-accent-ink"
				>{last ? finishLabel : 'Suivant'}<ArrowRight size={15} /></button
			>
		</div>
	</div>
</div>
