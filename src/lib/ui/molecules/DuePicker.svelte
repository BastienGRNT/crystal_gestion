<script lang="ts">
	import { X } from '@lucide/svelte';
	import { addDays, weekdayOf } from '$lib/modules/kernel/domain/dates';

	interface Props {
		value: string | null;
		today: string;
		onchange: (value: string | null) => void;
	}

	let { value, today, onchange }: Props = $props();

	const friday = $derived(addDays(today, (4 - weekdayOf(today) + 7) % 7 || 7));
	const quick = $derived([
		{ label: 'Aujourd’hui', date: today },
		{ label: 'Demain', date: addDays(today, 1) },
		{ label: 'Vendredi', date: friday },
		{ label: 'Dans 1 semaine', date: addDays(today, 7) }
	]);
</script>

<div class="flex flex-wrap items-center gap-2">
	<input
		type="date"
		value={value ?? ''}
		onchange={(e) => onchange(e.currentTarget.value || null)}
		aria-label="Échéance"
		class="h-10 rounded-xl border border-line-strong/70 bg-surface px-3 text-base text-ink outline-none hover:border-line-strong focus:border-accent"
	/>
	{#each quick as option (option.label)}
		<button
			type="button"
			onclick={() => onchange(option.date)}
			class={[
				'h-10 rounded-full border px-3.5 text-base transition-colors',
				value === option.date
					? 'border-accent bg-accent-soft font-medium text-accent-text'
					: 'border-line text-ink-2 hover:border-line-strong hover:bg-surface-2'
			]}>{option.label}</button
		>
	{/each}
	{#if value}
		<button
			type="button"
			onclick={() => onchange(null)}
			class="inline-flex h-10 items-center gap-1 rounded-full px-3 text-base text-ink-3 hover:bg-hover hover:text-ink"
			><X size={14} /> Sans échéance</button
		>
	{/if}
</div>
