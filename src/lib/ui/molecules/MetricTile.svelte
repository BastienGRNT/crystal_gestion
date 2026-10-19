<script lang="ts">
	import { Check, Settings2 } from '@lucide/svelte';
	import IconButton from '../atoms/IconButton.svelte';
	import Sparkline from '../atoms/Sparkline.svelte';
	import EditableText from './EditableText.svelte';
	import MetricInput from './MetricInput.svelte';
	import MetricSettings from './MetricSettings.svelte';
	import Popover from './Popover.svelte';

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
		goal: { reached: boolean; gap: number; progress: number | null } | null;
		onrename: (name: string) => void;
		onunit: (unit: string) => void;
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
		goal,
		onrename,
		onunit,
		ontarget,
		ondirection,
		onrecord,
		onremove
	}: Props = $props();

	let settingsOpen = $state(false);
	let settingsButton = $state<HTMLElement>();

	const format = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 });
	/** "42 %", "1 200 €", "8 clients". */
	const withUnit = (n: number) => `${format.format(n)}${unit ? ` ${unit}` : ''}`;
</script>

<article class="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4 shadow-card">
	<div class="flex items-start gap-1">
		<div class="min-w-0 flex-1">
			<EditableText
				label="Nom du chiffre"
				value={name}
				maxlength={60}
				class="text-base font-semibold"
				onsave={onrename}
			/>
		</div>
		<span bind:this={settingsButton}>
			<IconButton
				icon={Settings2}
				label="Régler : nombre ou %, sens, objectif"
				active={settingsOpen}
				onclick={() => (settingsOpen = !settingsOpen)}
			/>
		</span>
	</div>

	<div class="flex items-end justify-between gap-3">
		<p class="flex items-baseline gap-1.5">
			<span class="text-2xl font-semibold tabular-nums"
				>{last === null ? '—' : format.format(last)}</span
			>
			{#if unit}<span class="text-base text-ink-2">{unit}</span>{/if}
		</p>
		<span class={good === null ? 'text-ink-3' : good ? 'text-ok-text' : 'text-danger-text'}>
			<Sparkline {values} {target} label="Évolution de {name} sur {values.length} semaines" />
		</span>
	</div>

	<div class="flex flex-col gap-1.5">
		{#if target === null}
			<button
				type="button"
				class="-mx-2 h-10 self-start rounded-lg px-2 text-sm text-ink-3 hover:bg-hover hover:text-ink-2"
				onclick={() => (settingsOpen = true)}>Fixer un objectif</button
			>
		{:else}
			<p class="flex flex-wrap items-baseline justify-between gap-x-2 text-sm">
				<span class="text-ink-2">
					Objectif : {direction === 'up' ? 'au moins' : 'sous'}
					<span class="font-semibold tabular-nums">{withUnit(target)}</span>
				</span>
				{#if goal}
					<span class={goal.reached ? 'font-semibold text-ok-text' : 'text-ink-3'}>
						{#if goal.reached}Atteint{:else if direction === 'up'}encore {withUnit(
								goal.gap
							)}{:else}{withUnit(goal.gap)} de trop{/if}
					</span>
				{/if}
			</p>
			{#if goal?.progress != null}
				<div
					class="h-2 overflow-hidden rounded-full bg-sunken"
					role="progressbar"
					aria-label="Vers l’objectif"
					aria-valuemin={0}
					aria-valuemax={100}
					aria-valuenow={Math.round(goal.progress * 100)}
				>
					<div
						class={['h-full rounded-full', goal.reached ? 'bg-ok' : 'bg-accent']}
						style:width="{goal.progress * 100}%"
					></div>
				</div>
			{/if}
		{/if}
	</div>

	<p class="min-h-5 text-sm">
		{#if delta !== null && delta !== 0}
			<span class={['font-semibold', good ? 'text-ok-text' : 'text-danger-text']}
				>{delta > 0 ? '+' : '−'}{withUnit(Math.abs(delta))}</span
			>
			<span class="text-ink-3">sur la semaine</span>
		{:else if values.length < 2}
			<span class="text-ink-3">La courbe démarre au deuxième relevé.</span>
		{:else}
			<span class="text-ink-3">Stable sur la semaine</span>
		{/if}
	</p>

	<div class="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line pt-3">
		<label class="flex items-center gap-2 text-sm text-ink-2">
			Valeur de la semaine
			<MetricInput
				label="{name} cette semaine"
				value={thisWeek}
				placeholder={last === null ? '—' : `${format.format(last)} avant`}
				onsave={onrecord}
			/>
		</label>
		<span class="flex items-center gap-1 text-sm text-ink-3">
			{#if thisWeek !== null}<Check size={14} class="text-ok-text" aria-hidden="true" />Noté
			{:else}Entrée pour noter{/if}
		</span>
	</div>
</article>

<Popover
	bind:open={settingsOpen}
	anchor={settingsButton}
	placement="bottom-end"
	label="Réglages de {name}"
	class="w-80 p-4"
>
	<MetricSettings
		{unit}
		{target}
		{direction}
		{onunit}
		{ontarget}
		{ondirection}
		onremove={() => {
			settingsOpen = false;
			onremove();
		}}
	/>
</Popover>
