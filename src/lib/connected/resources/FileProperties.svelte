<script lang="ts">
	import { useProject } from '$lib/client/context';
	import { formatDay } from '$lib/client/format';
	import { formatSize, type ProjectFile } from '$lib/modules/files/domain/project-file';
	import Select from '$lib/ui/atoms/Select.svelte';
	import PropertyRow from '$lib/ui/molecules/PropertyRow.svelte';
	import { featureOptions } from './options';

	let { file }: { file: ProjectFile } = $props();
	const { store, actions } = useProject();
	const author = $derived(store.members.get(file.createdBy ?? '')?.name ?? 'Inconnu');
</script>

<div class="flex flex-col gap-0.5">
	<PropertyRow label="Dossier">
		<Select
			label="Dossier"
			value={file.featureId ?? ''}
			options={featureOptions(store.features.items, 'Général')}
			onchange={(id) => actions.files.update(file.id, { featureId: id || null })}
			class="-ml-2 w-full"
		/>
	</PropertyRow>
	<PropertyRow label="Taille"
		><span class="font-mono text-sm">{formatSize(file.size)}</span></PropertyRow
	>
	<PropertyRow label="Type"
		><span class="truncate font-mono text-sm text-ink-2">{file.mimeType}</span></PropertyRow
	>
	<PropertyRow label="Ajouté par"><span class="text-sm">{author}</span></PropertyRow>
	<PropertyRow label="Date">
		<span class="text-sm"
			>{formatDay(file.createdAt, {
				day: 'numeric',
				month: 'long',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			})}</span
		>
	</PropertyRow>
</div>
