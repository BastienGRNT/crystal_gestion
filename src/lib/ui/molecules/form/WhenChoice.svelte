<script lang="ts">
	import { CalendarDays } from '@lucide/svelte';
	import { formatDueDate } from '$lib/client/format';

	interface Props {
		choices: { label: string; value: string | null }[];
		value: string | null;
		onchange: (value: string | null) => void;
	}

	/** Dates as people say them, any other day through the calendar. */
	let { choices, value, onchange }: Props = $props();
	let picker: HTMLInputElement;
	const custom = $derived(!!value && !choices.some((c) => c.value === value));
	const chip =
		'inline-flex h-10 items-center gap-2 rounded-[10px] border-[1.5px] px-3.5 text-sm font-semibold transition';
	const tone = (on: boolean) =>
		on ? 'border-ink bg-surface-2' : 'border-line-strong hover:border-ink-3';
</script>

<div role="radiogroup" aria-label="Échéance" class="flex flex-wrap gap-2">
	{#each choices as choice (choice.label)}
		<button
			type="button"
			role="radio"
			aria-checked={choice.value === value}
			onclick={() => onchange(choice.value)}
			class="{chip} {tone(choice.value === value)} {choice.value ? '' : 'text-ink-3'}"
			>{choice.label}</button
		>
	{/each}
	<span class="relative">
		<button type="button" onclick={() => picker.showPicker?.()} class="{chip} {tone(custom)}">
			<CalendarDays size={15} />{custom ? formatDueDate(value!) : 'Une autre date…'}
		</button>
		<input
			bind:this={picker}
			type="date"
			tabindex="-1"
			aria-hidden="true"
			value={value ?? ''}
			onchange={(e) => onchange(e.currentTarget.value || null)}
			class="pointer-events-none absolute inset-0 opacity-0"
		/>
	</span>
</div>
