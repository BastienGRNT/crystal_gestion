<script lang="ts">
	import { ArrowDownRight, ArrowUpRight } from '@lucide/svelte';
	import Sparkline from '../atoms/Sparkline.svelte';
	import EditableText from './EditableText.svelte';
	import MetricInput from './MetricInput.svelte';

	interface Props {
		name: string;
		unit: string;
		target: number | null;
		direction: 'up' | 'down';
		values: number[];
		last: number | null;
		delta: number | null;
		/** The change goes the right way. */
		good: boolean | null;
		thisWeek: number | null;
		onrename: (name: string) => void;
		ontarget: (target: number | null) => void;
		ondirection: (direction: 'up' | 'down') => void;
		onrecord: (value: number) => void;
		onremove: () => void;
	}

	let {
		name,
		unit,
		target,
		direction,
		values,
		last,
		delta,
		good,
		thisWeek,
		onrename,
		ontarget,
		ondirection,
		onrecord,
		onremove
	}: Props = $props();

	function saveTarget(text: string) {
		const value = Number(text.replace(',', '.').replace(/[^\d.-]/g, ''));
		ontarget(text.trim() && Number.isFinite(value) ? value : null);
	}
</script>

<article
	class="group flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4 shadow-card"
>
	<EditableText
		label="Nom du chiffre"
		value={name}
		maxlength={60}
		class="text-base font-semibold"
		onsave={onrename}
	/>
	<div class="flex items-end justify-between gap-3">
		<p class="flex flex-wrap items-baseline gap-x-1.5">
			<span class="text-2xl font-semibold tabular-nums">{last ?? '—'}</span>
			{#if unit}<span class="text-base text-ink-2">{unit}</span>{/if}
			<span class="text-base text-ink-3">/</span>
			<EditableText
				label="Cible"
				value={target === null ? '' : String(target)}
				placeholder="cible ?"
				maxlength={14}
				class="text-base text-ink-3 tabular-nums"
				onsave={saveTarget}
			/>
		</p>
		<span class={good === null ? 'text-ink-3' : good ? 'text-ok-text' : 'text-danger-text'}>
			<Sparkline {values} {target} label="Évolution de {name} sur {values.length} semaines" />
		</span>
	</div>
	<p class="min-h-5 text-sm">
		{#if delta !== null && delta !== 0}
			<span class={['font-semibold', good ? 'text-ok-text' : 'text-danger-text']}
				>{delta > 0 ? '+' : ''}{delta}</span
			>
			<span class="text-ink-3">sur la semaine</span>
		{:else if values.length < 2}
			<span class="text-ink-3">La courbe démarre au deuxième relevé.</span>
		{:else}
			<span class="text-ink-3">Stable sur la semaine</span>
		{/if}
	</p>
	<div class="flex flex-wrap items-center gap-2 border-t border-line pt-3">
		<label class="flex items-center gap-2 text-sm text-ink-2">
			Cette semaine
			<MetricInput
				label="{name} cette semaine"
				value={thisWeek}
				placeholder={last === null ? '—' : `${last} avant`}
				onsave={onrecord}
			/>
		</label>
		<span class="ml-auto flex items-center gap-1 text-sm">
			<button
				class="inline-flex h-10 items-center gap-1 rounded-lg px-2 text-ink-3 hover:bg-hover hover:text-ink-2"
				title="Ce qui est une bonne nouvelle : que ça monte ou que ça baisse"
				onclick={() => ondirection(direction === 'up' ? 'down' : 'up')}
			>
				{#if direction === 'up'}<ArrowUpRight size={15} />Monter{:else}<ArrowDownRight
						size={15}
					/>Baisser{/if}
			</button>
			<button
				class="h-10 rounded-lg px-2 text-ink-3 hover:bg-danger-soft hover:text-danger-text"
				onclick={onremove}>Retirer</button
			>
		</span>
	</div>
</article>
