<script lang="ts">
	import { CalendarSearch } from '@lucide/svelte';

	interface Props {
		value: string | null;
		onchange: (value: string | null) => void;
		label: string;
	}

	/** A calendar icon that opens the native date picker: any date, without a raw date field. */
	let { value, onchange, label }: Props = $props();
	let input: HTMLInputElement;
</script>

<span class="relative inline-flex">
	<button
		type="button"
		title={label}
		aria-label={label}
		onclick={() => input.showPicker?.()}
		class="flex size-8 items-center justify-center rounded-lg text-ink-3 transition hover:bg-hover hover:text-ink"
		><CalendarSearch size={15} /></button
	>
	<input
		bind:this={input}
		type="date"
		tabindex="-1"
		aria-hidden="true"
		value={value ?? ''}
		onchange={(event) => onchange(event.currentTarget.value || null)}
		class="pointer-events-none absolute inset-0 opacity-0"
	/>
</span>
