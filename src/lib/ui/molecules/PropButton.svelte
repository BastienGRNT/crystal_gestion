<script lang="ts" generics="V">
	import type { Component, Snippet } from 'svelte';
	import PickMenu from './PickMenu.svelte';
	import type { PickOption } from '../types';

	interface Props {
		/** Menu title, and the button text while nothing is chosen. */
		label: string;
		icon: Component<{ size?: number; class?: string }>;
		options: PickOption<V>[];
		onpick: (value: V) => void;
		multiple?: boolean;
		/** The chosen value, drawn by the caller; empty → the label as a placeholder. */
		value?: Snippet;
		align?: 'start' | 'end';
		/** Borderless: inside a list row or a property grid. */
		ghost?: boolean;
	}

	let {
		label,
		icon: Icon,
		options,
		onpick,
		multiple = false,
		value,
		align = 'start',
		ghost = false
	}: Props = $props();
</script>

<!-- Every editable property looks the same: one button, one menu. -->
<PickMenu title={label} {options} {onpick} {multiple} {align}>
	{#snippet trigger(toggle)}
		<button
			type="button"
			onclick={toggle}
			title={label}
			class="inline-flex h-8 max-w-full items-center gap-1.5 rounded-lg px-2.5 text-ui transition hover:bg-hover {ghost
				? ''
				: 'border border-line'} {value ? 'text-ink' : 'text-ink-3'}"
		>
			{#if value}{@render value()}{:else}<Icon size={14} class="shrink-0" />{label}{/if}
		</button>
	{/snippet}
</PickMenu>
