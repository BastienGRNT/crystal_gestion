<script lang="ts">
	import { Gem } from '@lucide/svelte';

	interface Props {
		value: string;
		options: { value: string; label: string; short?: string }[];
		onchange: (value: string) => void;
		label: string;
		placeholder?: string;
	}

	let { value, options, onchange, label, placeholder = 'Aucune' }: Props = $props();
	const current = $derived(value ? options.find((option) => option.value === value) : undefined);
</script>

<!-- A native select under a chip: compact on desktop, the system picker on mobile. -->
<label
	class="relative inline-flex h-6 max-w-full min-w-0 items-center gap-1 rounded-full border px-2 text-[12px] transition focus-within:ring-2 focus-within:ring-accent/30 {current
		? 'border-transparent bg-accent-soft text-accent hover:brightness-95 dark:hover:brightness-125'
		: 'border-dashed border-line-strong text-ink-3 hover:text-ink-2'}"
	title={label}
>
	<Gem size={11} class="shrink-0" />
	<span class="truncate">{current ? (current.short ?? current.label) : placeholder}</span>
	<select
		aria-label={label}
		{value}
		onchange={(event) => onchange(event.currentTarget.value)}
		class="absolute inset-0 cursor-pointer opacity-0"
	>
		{#each options as option (option.value)}<option value={option.value}>{option.label}</option
			>{/each}
	</select>
</label>
