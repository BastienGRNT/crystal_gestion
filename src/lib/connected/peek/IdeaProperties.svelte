<script lang="ts">
	import { Layers } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import { formatDay, timeAgo } from '$lib/client/format';
	import { featureColors } from '$lib/client/views/feature-colors';
	import { featureOptions } from '$lib/client/views/task-menus';
	import { needsTriage, type Idea } from '$lib/modules/ideas/domain/idea';
	import Avatar from '$lib/ui/atoms/Avatar.svelte';
	import FeatureMark from '$lib/ui/atoms/FeatureMark.svelte';
	import PropButton from '$lib/ui/molecules/PropButton.svelte';
	import PropertyRow from '$lib/ui/molecules/PropertyRow.svelte';

	let { idea }: { idea: Idea } = $props();
	const { store, actions } = useProject();
	const author = $derived(store.members.get(idea.createdBy ?? ''));
	const feature = $derived(store.features.get(idea.featureId ?? ''));
	const colorOf = $derived(featureColors(store.features.items));
	const state = $derived(
		idea.archivedAt ? 'Archivée' : needsTriage(idea) ? 'Nouvelle, à trier' : 'Gardée pour plus tard'
	);
</script>

<div class="flex flex-col">
	<PropertyRow label="État"><span class="px-2.5 text-ui text-ink-2">{state}</span></PropertyRow>
	<PropertyRow label="Feature">
		<PropButton
			ghost
			label="Aucune"
			icon={Layers}
			options={featureOptions(store.features.items, idea.featureId)}
			onpick={(featureId) => actions.ideas.update(idea.id, { featureId })}
			value={feature ? featureValue : undefined}
		/>
	</PropertyRow>
	<PropertyRow label="Notée">
		<span
			class="flex items-center gap-1.5 px-2.5 text-ui text-ink-2"
			title={formatDay(idea.createdAt)}
		>
			{#if author}<Avatar name={author.name} color={author.color} size={18} />{author.name} ·{/if}
			{timeAgo(idea.createdAt)}
		</span>
	</PropertyRow>
</div>

{#snippet featureValue()}<FeatureMark
		title={feature!.title}
		color={colorOf(feature!.id)}
	/>{/snippet}
