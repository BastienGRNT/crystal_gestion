<script lang="ts">
	import { Check } from '@lucide/svelte';

	interface Props {
		steps: { label: string; hint: string; clear: boolean }[];
		current: number;
		onpick: (index: number) => void;
	}

	let { steps, current, onpick }: Props = $props();
</script>

<nav
	class="flex gap-0.5 overflow-x-auto md:sticky md:top-20 md:flex-col"
	aria-label="Étapes de la revue"
>
	{#each steps as step, i (step.label)}
		{@const done = i < current || step.clear}
		<button
			type="button"
			onclick={() => onpick(i)}
			aria-current={i === current ? 'step' : undefined}
			class="flex shrink-0 items-center gap-3 rounded-[10px] p-2.5 text-left transition hover:bg-hover {i ===
			current
				? 'bg-hover'
				: ''}"
		>
			<span
				class="flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold {i ===
				current
					? 'bg-accent text-white'
					: done
						? 'bg-success text-white'
						: 'bg-sunken text-ink-3'}"
			>
				{#if done && i !== current}<Check size={13} strokeWidth={3} />{:else}{i + 1}{/if}
			</span>
			<span>
				<span class="block text-sm font-medium">{step.label}</span>
				<span class="block text-xs text-ink-3 max-md:hidden">{step.hint}</span>
			</span>
		</button>
	{/each}
</nav>
