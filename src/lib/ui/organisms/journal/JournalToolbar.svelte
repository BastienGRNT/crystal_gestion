<script lang="ts">
	import type { JournalFilter } from '$lib/client/views/journal-timeline';
	import Select from '../../atoms/Select.svelte';
	import SearchField from '../../molecules/SearchField.svelte';
	import Segmented from '../../molecules/Segmented.svelte';

	interface Props {
		filter: JournalFilter;
		counts: Record<JournalFilter['kind'], number>;
		featureOptions: { value: string; label: string }[];
	}

	let { filter = $bindable(), counts, featureOptions }: Props = $props();
	const kinds = $derived(
		(
			[
				['all', 'Tout'],
				['decision', 'Décisions'],
				['fix', 'Fixes'],
				['scope', 'Périmètre']
			] as const
		).map(([value, label]) => ({ value, label: `${label} ${counts[value]}` }))
	);
</script>

<div class="flex flex-wrap items-center gap-2">
	<Segmented
		label="Type d’entrée"
		value={filter.kind}
		options={kinds}
		onchange={(kind) => (filter.kind = kind)}
	/>
	<Select
		label="Feature"
		value={filter.featureId}
		options={featureOptions}
		onchange={(id) => (filter.featureId = id)}
		class="max-w-56"
	/>
	<div class="w-full sm:ml-auto sm:w-64">
		<SearchField bind:value={filter.query} placeholder="Chercher dans le journal" />
	</div>
</div>
