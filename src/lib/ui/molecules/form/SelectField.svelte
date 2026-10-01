<script lang="ts" generics="V">
	import type { Snippet } from 'svelte';
	import { ChevronDown } from '@lucide/svelte';
	import PickMenu from '../PickMenu.svelte';
	import type { PickOption } from '../../types';

	interface Props {
		label: string;
		options: PickOption<V>[];
		onpick: (value: V) => void;
		/** The current value, drawn by the caller. */
		value: Snippet;
	}

	/** Looks like a form field, opens a searchable list: one look for every « pick one ». */
	let { label, options, onpick, value }: Props = $props();
</script>

<PickMenu title={label} {options} {onpick}>
	{#snippet trigger(toggle)}
		<button
			type="button"
			onclick={toggle}
			aria-label={label}
			class="flex h-11 w-full items-center gap-2.5 rounded-[12px] border-[1.5px] border-line-strong bg-surface px-3.5 text-left text-[15px] font-semibold transition hover:border-ink-3"
		>
			<span class="flex min-w-0 flex-1 items-center gap-2.5 truncate">{@render value()}</span>
			<ChevronDown size={17} class="shrink-0 text-ink-3" />
		</button>
	{/snippet}
</PickMenu>
