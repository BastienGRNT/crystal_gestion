<script lang="ts" generics="T extends string">
	import type { Component } from 'svelte';

	interface Props {
		value: T;
		options: { value: T; label: string; tone?: string; icon?: Component<{ size?: number }> }[];
		onchange: (value: T) => void;
		label: string;
	}

	let { value, options, onchange, label }: Props = $props();
</script>

<div
	class="inline-flex max-w-full shrink-0 gap-0.5 overflow-x-auto rounded-lg bg-sunken p-0.5"
	role="radiogroup"
	aria-label={label}
>
	{#each options as option (option.value)}
		<button
			type="button"
			role="radio"
			aria-checked={option.value === value}
			onclick={() => onchange(option.value)}
			class="inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-ui font-medium whitespace-nowrap transition {option.value ===
			value
				? `bg-panel shadow-sm ${option.tone ?? 'text-ink'}`
				: 'text-ink-3 hover:text-ink'}"
		>
			{#if option.icon}<option.icon size={14} />{/if}{option.label}
		</button>
	{/each}
</div>
