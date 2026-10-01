<script lang="ts">
	import { ChevronLeft, ChevronRight } from '@lucide/svelte';
	import Button from '$lib/ui/atoms/Button.svelte';
	import IconButton from '$lib/ui/atoms/IconButton.svelte';
	import Segmented from '$lib/ui/molecules/Segmented.svelte';
	import type { AgendaAudience, AgendaLayer, AgendaScale } from './types';

	interface Props {
		scale: AgendaScale;
		audience: AgendaAudience;
		layer: AgendaLayer;
		onscale: (scale: AgendaScale) => void;
		onaudience: (audience: AgendaAudience) => void;
		onlayer: (layer: AgendaLayer) => void;
		onstep: (direction: -1 | 1) => void;
		ontoday: () => void;
	}

	let { scale, audience, layer, onscale, onaudience, onlayer, onstep, ontoday }: Props = $props();
	const previous = $derived(scale === 'week' ? 'Semaine précédente' : 'Jour précédent');
	const next = $derived(scale === 'week' ? 'Semaine suivante' : 'Jour suivant');
</script>

<div class="mb-4 flex flex-wrap items-center gap-2.5">
	<div class="flex items-center gap-0.5">
		<IconButton label="{previous} (←)" onclick={() => onstep(-1)}
			><ChevronLeft size={16} /></IconButton
		>
		<Button size="sm" onclick={ontoday} title="Aujourd’hui (A)">Aujourd’hui</Button>
		<IconButton label="{next} (→)" onclick={() => onstep(1)}><ChevronRight size={16} /></IconButton>
	</div>
	<Segmented
		label="Échelle"
		value={scale}
		onchange={onscale}
		options={[
			{ value: 'week', label: 'Semaine' },
			{ value: 'day', label: 'Jour' }
		]}
	/>
	<Segmented
		label="Personnes"
		value={audience}
		onchange={onaudience}
		options={[
			{ value: 'me', label: 'Moi' },
			{ value: 'team', label: 'Équipe' }
		]}
	/>
	<div class="ml-auto flex items-center gap-2">
		<span class="hidden text-sm text-ink-2 lg:inline">Glisse sur la grille pour ajouter :</span>
		<Segmented
			label="Ce que tu ajoutes en glissant"
			value={layer}
			onchange={onlayer}
			options={[
				{ value: 'availability', label: 'Mes dispos', tone: 'text-accent-text' },
				{ value: 'block', label: 'Temps passé' }
			]}
		/>
	</div>
</div>
