<script lang="ts">
	import { useProject } from '$lib/client/context';
	import { formatDay, timeAgo } from '$lib/client/format';
	import { ElementSources } from '$lib/client/views/element-sources.svelte';
	import { needsTriage, type Idea } from '$lib/modules/ideas/domain/idea';
	import Avatar from '$lib/ui/atoms/Avatar.svelte';
	import Badge from '$lib/ui/atoms/Badge.svelte';
	import Select from '$lib/ui/atoms/Select.svelte';
	import PropertyRow from '$lib/ui/molecules/PropertyRow.svelte';

	let { idea }: { idea: Idea } = $props();
	const { store, actions } = useProject();
	const sources = new ElementSources(store);
	const author = $derived(store.members.get(idea.createdBy ?? ''));
</script>

<div class="flex flex-col gap-1">
	<PropertyRow label="État">
		<span class="px-2">
			{#if idea.archivedAt}<Badge>Archivée</Badge>
			{:else if needsTriage(idea)}<Badge tone="should">À trier</Badge>
			{:else}<Badge tone="success">Gardée</Badge>{/if}
		</span>
	</PropertyRow>
	<PropertyRow label="Feature">
		<Select
			label="Feature"
			value={idea.featureId ?? ''}
			options={sources.featureOptions()}
			class="w-full"
			onchange={(id) => actions.ideas.update(idea.id, { featureId: id || null })}
		/>
	</PropertyRow>
	<PropertyRow label="Notée">
		<span
			class="flex items-center gap-1.5 px-2 text-[13px] text-ink-2"
			title={formatDay(idea.createdAt)}
		>
			{#if author}<Avatar name={author.name} color={author.color} size={18} />{author.name} ·{/if}
			{timeAgo(idea.createdAt)}
		</span>
	</PropertyRow>
</div>
