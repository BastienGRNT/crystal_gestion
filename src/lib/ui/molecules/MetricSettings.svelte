<script lang="ts">
	import { ArrowDownRight, ArrowUpRight } from '@lucide/svelte';
	import Button from '../atoms/Button.svelte';
	import TextInput from '../atoms/TextInput.svelte';
	import Segmented from './Segmented.svelte';

	interface Props {
		unit: string;
		target: number | null;
		direction: 'up' | 'down';
		onunit: (unit: string) => void;
		ontarget: (target: number | null) => void;
		ondirection: (direction: 'up' | 'down') => void;
		onremove: () => void;
	}

	let { unit, target, direction, onunit, ontarget, ondirection, onremove }: Props = $props();

	type Kind = 'number' | '%' | '€' | 'h';
	const KINDS: { value: Kind; label: string }[] = [
		{ value: 'number', label: 'Nombre' },
		{ value: '%', label: '%' },
		{ value: '€', label: '€' },
		{ value: 'h', label: 'Heures' }
	];
	// Any other unit ("clients", "k€") is a count with its own word.
	const kind = $derived<Kind>(unit === '%' || unit === '€' || unit === 'h' ? unit : 'number');

	let unitText = $derived(kind === 'number' ? unit : '');
	let targetText = $derived(target === null ? '' : String(target));

	function saveUnit() {
		if (unitText.trim() !== unit) onunit(unitText.trim());
	}

	function saveTarget() {
		const text = targetText.trim().replace(',', '.').replace(/\s/g, '');
		const value = text ? Number(text) : null;
		if (value !== null && !Number.isFinite(value)) return;
		if (value !== target) ontarget(value);
	}

	const onEnter = (save: () => void) => (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			save();
		}
	};
</script>

<div class="flex flex-col gap-4">
	<div class="flex flex-col gap-2">
		<span class="text-sm font-semibold text-ink-2">Ce que tu comptes</span>
		<Segmented
			label="Ce que tu comptes"
			size="sm"
			stretch
			options={KINDS}
			value={kind}
			onchange={(next) => onunit(next === 'number' ? '' : next)}
		/>
		{#if kind === 'number'}
			<TextInput
				bind:value={unitText}
				aria-label="Unité"
				placeholder="Unité, si tu veux : clients, rdv…"
				maxlength={12}
				onblur={saveUnit}
				onkeydown={onEnter(saveUnit)}
			/>
		{/if}
	</div>

	<div class="flex flex-col gap-2">
		<span class="text-sm font-semibold text-ink-2">C’est une bonne nouvelle quand ça…</span>
		<Segmented
			label="Bonne nouvelle quand ça monte ou quand ça baisse"
			size="sm"
			stretch
			options={[
				{ value: 'up', label: 'Monte', icon: ArrowUpRight },
				{ value: 'down', label: 'Baisse', icon: ArrowDownRight }
			]}
			value={direction}
			onchange={ondirection}
		/>
	</div>

	<label class="flex flex-col gap-2">
		<span class="text-sm font-semibold text-ink-2">
			Objectif : {direction === 'up' ? 'atteindre au moins' : 'rester sous'}
		</span>
		<span class="flex items-center gap-2">
			<TextInput
				bind:value={targetText}
				inputmode="decimal"
				placeholder="Aucun objectif"
				class="tabular-nums"
				onblur={saveTarget}
				onkeydown={onEnter(saveTarget)}
			/>
			{#if unit}<span class="shrink-0 text-base text-ink-2">{unit}</span>{/if}
		</span>
		<span class="text-sm text-ink-3">Laisse vide pour juste suivre la courbe.</span>
	</label>

	<div class="border-t border-line pt-3">
		<Button variant="ghost" size="sm" class="text-danger-text" onclick={onremove}>
			Ne plus suivre ce chiffre
		</Button>
	</div>
</div>
