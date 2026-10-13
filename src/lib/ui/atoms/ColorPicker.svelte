<script lang="ts">
	import { Check } from '@lucide/svelte';
	import { tint } from '$lib/client/labels';

	let {
		value,
		onchange,
		label = 'Couleur'
	}: { value: number; onchange: (value: number) => void; label?: string } = $props();
</script>

<div class="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
	{#each Array.from({ length: 8 }, (_, i) => i) as color (color)}
		<button
			type="button"
			role="radio"
			aria-checked={value === color}
			aria-label="Couleur {color + 1}"
			onclick={() => onchange(color)}
			class={[
				'flex size-8 items-center justify-center rounded-full text-white transition-transform hover:scale-110',
				value === color && 'ring-2 ring-ink ring-offset-2 ring-offset-surface'
			]}
			style:background-color={tint(color)}
		>
			{#if value === color}<Check size={15} strokeWidth={3} />{/if}
		</button>
	{/each}
</div>
