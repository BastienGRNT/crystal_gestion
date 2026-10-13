<script lang="ts">
	import { BOXES } from '$lib/client/labels';
	import type { Quadrant } from '$lib/modules/tasks/domain/task';

	interface Props {
		value: Quadrant | null;
		onchange: (value: Quadrant | null) => void;
	}

	let { value, onchange }: Props = $props();
	// Laid out like the matrix itself: urgent on the left, important on top.
	const grid: Quadrant[] = ['now', 'plan', 'delegate', 'later'];
</script>

<div class="flex flex-col gap-1.5" role="radiogroup" aria-label="Case de la matrice">
	<div class="grid grid-cols-2 gap-1.5">
		{#each grid as quadrant (quadrant)}
			{@const box = BOXES[quadrant]}
			{@const selected = value === quadrant}
			<button
				type="button"
				role="radio"
				aria-checked={selected}
				onclick={() => onchange(quadrant)}
				class={[
					'flex flex-col items-start gap-0.5 rounded-xl border px-3.5 py-2.5 text-left transition-colors',
					selected
						? [box.soft, 'border-current', box.text]
						: 'border-line hover:border-line-strong hover:bg-surface-2'
				]}
			>
				<span class="flex items-center gap-1.5 text-base font-semibold">
					<span class={['size-2 rounded-full', box.dot]}></span>{box.label}
				</span>
				<span class={['text-xs', selected ? 'opacity-80' : 'text-ink-3']}>{box.axes}</span>
			</button>
		{/each}
	</div>
	<button
		type="button"
		role="radio"
		aria-checked={value === null}
		onclick={() => onchange(null)}
		class={[
			'h-10 rounded-xl border text-base transition-colors',
			value === null
				? 'border-ink-3 bg-surface-2 font-medium text-ink'
				: 'border-dashed border-line-strong text-ink-3 hover:text-ink-2'
		]}>{value === null ? 'À trier plus tard' : 'Retirer de la matrice (à trier)'}</button
	>
</div>
