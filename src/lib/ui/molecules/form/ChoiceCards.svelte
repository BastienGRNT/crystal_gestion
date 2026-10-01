<script lang="ts" generics="V extends string">
	import type { Component } from 'svelte';
	import { Check } from '@lucide/svelte';

	interface Choice {
		value: V;
		label: string;
		hint: string;
		icon?: Component<{ size?: number }>;
		/** CSS color of the label (Fix in red). */
		color?: string;
	}

	interface Props {
		label: string;
		choices: Choice[];
		value: V;
		onchange: (value: V) => void;
	}

	/** A few exclusive options, each explained in a few words: nothing to guess. */
	let { label, choices, value, onchange }: Props = $props();
</script>

<div
	role="radiogroup"
	aria-label={label}
	class="grid gap-2.5"
	style="grid-template-columns:repeat({Math.min(choices.length, 4)},minmax(0,1fr))"
>
	{#each choices as choice (choice.value)}
		{@const on = choice.value === value}
		<button
			type="button"
			role="radio"
			aria-checked={on}
			onclick={() => onchange(choice.value)}
			class="relative flex flex-col gap-0.5 rounded-[13px] border-[1.5px] px-3.5 py-3 text-left transition {on
				? 'border-ink bg-surface-2 shadow-[inset_0_0_0_0.5px_var(--ink)]'
				: 'border-line-strong hover:border-ink-3'}"
		>
			<span class="flex items-center gap-1.5 pr-6 text-sm font-bold" style:color={choice.color}>
				{#if choice.icon}<choice.icon size={16} />{/if}{choice.label}
			</span>
			<span class="text-xs leading-snug text-ink-3">{choice.hint}</span>
			{#if on}<span
					class="absolute top-2.5 right-2.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-ink"
					><Check size={12} strokeWidth={3} /></span
				>{/if}
		</button>
	{/each}
</div>
