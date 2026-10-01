<script lang="ts" generics="T extends string">
	import type { Component } from 'svelte';

	interface Props {
		value: T;
		options: { value: T; label: string; tone?: string; icon?: Component<{ size?: number }> }[];
		onchange: (value: T) => void;
		label: string;
	}

	/** A switch between a few settings of a view (Semaine / Jour), big enough to read and hit. */
	let { value, options, onchange, label }: Props = $props();
</script>

<div
	class="inline-flex max-w-full shrink-0 gap-1 overflow-x-auto rounded-[12px] border-[1.5px] border-line-strong bg-surface p-1"
	role="radiogroup"
	aria-label={label}
>
	{#each options as option (option.value)}
		<button
			type="button"
			role="radio"
			aria-checked={option.value === value}
			onclick={() => onchange(option.value)}
			class="inline-flex h-8 items-center gap-2 rounded-[8px] px-3 text-sm font-bold whitespace-nowrap transition {option.value ===
			value
				? `bg-primary text-primary-ink ${option.tone ?? ''}`
				: 'text-ink-2 hover:bg-hover hover:text-ink'}"
		>
			{#if option.icon}<option.icon size={15} />{/if}{option.label}
		</button>
	{/each}
</div>
