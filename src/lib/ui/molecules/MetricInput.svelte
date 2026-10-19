<script lang="ts">
	import Button from '../atoms/Button.svelte';

	interface Props {
		/** What is measured, for the field's label ("Clients payants cette semaine"). */
		label: string;
		/** This week's value when already written. */
		value: number | null;
		onsave: (value: number) => void;
	}

	let { label, value, onsave }: Props = $props();
	// Follows the saved value, until someone types over it.
	let text = $derived(value === null ? '' : String(value));

	function submit(event: SubmitEvent) {
		event.preventDefault();
		const number = Number(text.replace(',', '.'));
		if (text.trim() && Number.isFinite(number)) onsave(number);
	}
</script>

<form class="flex items-center gap-2" onsubmit={submit}>
	<input
		bind:value={text}
		inputmode="decimal"
		aria-label={label}
		placeholder="—"
		class="h-10 w-24 rounded-xl border border-line-strong/70 bg-surface px-3 text-base tabular-nums outline-none focus:border-accent focus:ring-4 focus:ring-accent-soft"
	/>
	<Button type="submit" size="sm" disabled={!text.trim() || text === String(value)}
		>{value === null ? 'Noter' : 'Corriger'}</Button
	>
</form>
