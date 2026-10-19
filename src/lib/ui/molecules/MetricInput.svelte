<script lang="ts">
	import { Check } from '@lucide/svelte';

	interface Props {
		/** What is measured, for the field's label ("Clients payants cette semaine"). */
		label: string;
		/** This week's value when already written. */
		value: number | null;
		/** Shown while empty, like last week's value. */
		placeholder?: string;
		onsave: (value: number) => void;
	}

	let { label, value, placeholder = '—', onsave }: Props = $props();
	// Follows the saved value, until someone types over it.
	let text = $derived(value === null ? '' : String(value));
	let saved = $state(false);

	/** Enter or leaving the field saves: no button to find. */
	function save() {
		const number = Number(text.replace(',', '.').replace(/\s/g, ''));
		if (!text.trim() || !Number.isFinite(number) || number === value) return;
		onsave(number);
		saved = true;
		setTimeout(() => (saved = false), 1500);
	}
</script>

<span class="relative inline-flex items-center">
	<input
		bind:value={text}
		inputmode="decimal"
		aria-label={label}
		{placeholder}
		class="h-11 w-28 rounded-xl border border-line-strong/70 bg-surface px-3 pr-8 text-base tabular-nums outline-none placeholder:text-ink-3 focus:border-accent focus:ring-4 focus:ring-accent-soft"
		onblur={save}
		onkeydown={(e) => {
			if (e.key === 'Enter') {
				e.preventDefault();
				save();
			}
		}}
	/>
	{#if saved}<Check
			size={16}
			class="pointer-events-none absolute right-2.5 text-ok-text"
			aria-label="Enregistré"
		/>{/if}
</span>
