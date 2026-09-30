<script lang="ts">
	import { onMount } from 'svelte';
	import type { Suggestion } from '../types';
	import Button from '../atoms/Button.svelte';
	import RefTextArea from './RefTextArea.svelte';

	interface Props {
		value: string;
		suggest: (symbol: '#' | '@', query: string) => Suggestion[];
		onsave: () => void;
		oncancel: () => void;
	}

	let { value = $bindable(), suggest, onsave, oncancel }: Props = $props();
	let element = $state<HTMLTextAreaElement>();

	onMount(() => {
		element?.focus();
		element?.setSelectionRange(value.length, value.length);
	});
</script>

<div class="mt-1">
	<div class="rounded-lg border border-accent/50 bg-surface px-3 py-2 ring-3 ring-accent/12">
		<RefTextArea
			bind:value
			bind:element
			{suggest}
			onsubmit={onsave}
			{oncancel}
			class="min-h-6 text-[14px] leading-[1.55]"
		/>
	</div>
	<div class="mt-1.5 flex items-center gap-2 text-[11.5px] text-ink-3">
		<Button size="sm" variant="primary" disabled={!value.trim()} onclick={onsave}
			>Enregistrer</Button
		>
		<Button size="sm" variant="ghost" onclick={oncancel}>Annuler</Button>
		<span class="hidden sm:inline">Entrée pour enregistrer · Échap pour annuler</span>
	</div>
</div>
