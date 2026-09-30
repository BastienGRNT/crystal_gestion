<script lang="ts" generics="T extends string">
	import { ChevronDown } from '@lucide/svelte';

	interface Props {
		value: T;
		options: { value: T; label: string }[];
		onchange: (value: T) => void;
		label: string;
		class?: string;
	}

	let { value, options, onchange, label, class: extra = '' }: Props = $props();
</script>

<span class="relative inline-flex {extra}">
	<select
		aria-label={label}
		{value}
		onchange={(event) => onchange(event.currentTarget.value as T)}
		class="h-8 w-full appearance-none truncate rounded-md border border-transparent bg-transparent pr-7 pl-2 text-[13px] transition outline-none hover:border-line hover:bg-surface focus:border-accent"
	>
		{#each options as option (option.value)}<option value={option.value}>{option.label}</option
			>{/each}
	</select>
	<ChevronDown
		size={13}
		class="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-ink-3"
	/>
</span>
