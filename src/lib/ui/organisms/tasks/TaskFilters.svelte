<script lang="ts">
	import { Bug, ChevronDown, Layers } from '@lucide/svelte';
	import PickMenu from '../../molecules/PickMenu.svelte';
	import Segmented from '../../molecules/Segmented.svelte';
	import type { PickOption } from '../../types';

	interface Props {
		mine: boolean;
		featureLabel: string | null;
		features: PickOption<string>[];
		bugsOnly: boolean;
		onmine: (mine: boolean) => void;
		onfeature: (feature: string) => void;
		onbugs: () => void;
	}

	let { mine, featureLabel, features, bugsOnly, onmine, onfeature, onbugs }: Props = $props();
	const chip =
		'inline-flex h-[30px] items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium whitespace-nowrap transition';
</script>

<div
	class="sticky top-14 z-[5] flex flex-wrap items-center gap-2 border-b border-line bg-panel px-5 py-2.5 max-md:px-4"
>
	<Segmented
		label="Tâches de"
		value={mine ? 'me' : 'all'}
		options={[
			{ value: 'all', label: 'Équipe' },
			{ value: 'me', label: 'Moi' }
		]}
		onchange={(v) => onmine(v === 'me')}
	/>
	<PickMenu title="Filtrer par feature" options={features} onpick={onfeature}>
		{#snippet trigger(toggle)}
			<button
				type="button"
				onclick={toggle}
				class="{chip} {featureLabel
					? 'border-accent text-accent-text'
					: 'border-line text-ink-2 hover:bg-hover'}"
			>
				<Layers size={14} />{featureLabel ?? 'Toutes les features'}<ChevronDown size={13} />
			</button>
		{/snippet}
	</PickMenu>
	<button
		type="button"
		aria-pressed={bugsOnly}
		onclick={onbugs}
		class="{chip} {bugsOnly
			? 'border-must bg-must/10 text-must'
			: 'border-line text-ink-2 hover:bg-hover'}"
	>
		<Bug size={14} />Bugs seulement
	</button>
	<span class="flex-1"></span>
	<span class="hidden text-xs text-ink-3 lg:inline"
		>Clique sur un statut, une date ou un avatar pour le changer</span
	>
</div>
