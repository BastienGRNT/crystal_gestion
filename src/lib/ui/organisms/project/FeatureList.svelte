<script lang="ts">
	import { MOSCOW_LABELS, type Moscow } from '$lib/modules/features/domain/feature';
	import QuickAdd from '../../molecules/QuickAdd.svelte';
	import Segmented from '../../molecules/Segmented.svelte';
	import type { FeatureRowView } from '../../types';
	import FeatureRow from './FeatureRow.svelte';

	interface Props {
		features: FeatureRowView[];
		wontCount: number;
		wontHref: string;
		onpriority: (id: string, priority: Moscow) => void;
		onadd: (title: string, priority: Moscow) => void;
	}

	let { features, wontCount, wontHref, onpriority, onadd }: Props = $props();
	let priority = $state<Moscow>('should');
	const options = (['must', 'should', 'could', 'wont'] as const).map((value) => ({ value, label: MOSCOW_LABELS[value] }));
</script>

<div class="rounded-xl border border-line bg-surface px-3">
	{#each features as feature (feature.id)}
		<FeatureRow {feature} onpriority={(next) => onpriority(feature.id, next)} />
	{:else}
		<p class="py-6 text-center text-[13px] text-ink-3">Aucune feature. Décris la première ci-dessous : tâches, fil de discussion et dossier suivront.</p>
	{/each}
</div>
<div class="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
	<div class="flex-1"><QuickAdd placeholder="Nouvelle feature…" onadd={(title) => onadd(title, priority)} /></div>
	<Segmented label="Priorité de la nouvelle feature" value={priority} {options} onchange={(value) => (priority = value)} />
</div>
{#if wontCount}
	<a href={wontHref} class="mt-3 inline-block text-[12.5px] text-ink-3 hover:text-accent">{wontCount} feature{wontCount > 1 ? 's' : ''} en Won’t → Idées / Plus tard</a>
{/if}
