<script lang="ts">
	import { MOSCOW_LABELS, type Moscow } from '$lib/modules/features/domain/feature';
	import Dot from '../../atoms/Dot.svelte';
	import { PRIORITY_COLORS } from '../../tones';
	import type { FeatureRowView, PickOption } from '../../types';
	import FeatureRow from './FeatureRow.svelte';

	interface Props {
		features: FeatureRowView[];
		owners: (feature: FeatureRowView) => PickOption<string>[];
		onpriority: (id: string, priority: Moscow) => void;
		onowner: (id: string, ownerId: string) => void;
	}

	let { features, owners, onpriority, onowner }: Props = $props();
	const groups = $derived(
		(['must', 'should', 'could'] as const)
			.map((priority) => ({ priority, rows: features.filter((f) => f.priority === priority) }))
			.filter((group) => group.rows.length)
	);
</script>

{#each groups as group (group.priority)}
	<div class="flex items-center gap-2 px-3 pt-5 pb-2">
		<Dot color={PRIORITY_COLORS[group.priority]} size={8} />
		<span class="text-ui font-semibold">{MOSCOW_LABELS[group.priority]}</span>
	</div>
	<div class="rounded-xl border border-line bg-surface">
		{#each group.rows as feature (feature.id)}
			<FeatureRow
				{feature}
				owners={owners(feature)}
				onpriority={(next) => onpriority(feature.id, next)}
				onowner={(id) => onowner(feature.id, id)}
			/>
		{/each}
	</div>
{/each}
