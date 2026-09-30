<script lang="ts">
	import { Download, FolderInput } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import type { ProjectFile } from '$lib/modules/files/domain/project-file';
	import IconLink from '$lib/ui/atoms/IconLink.svelte';
	import ConfirmDelete from '$lib/ui/molecules/ConfirmDelete.svelte';
	import IconSelect from '$lib/ui/molecules/IconSelect.svelte';
	import { featureOptions, fileUrl } from './options';

	let { file }: { file: ProjectFile } = $props();
	const { store, actions } = useProject();
</script>

<IconLink href="{fileUrl(file.projectId, file.id)}?download" label="Télécharger" download
	><Download size={13} /></IconLink
>
<IconSelect
	label="Déplacer vers…"
	value={file.featureId ?? ''}
	options={featureOptions(store.features.items, 'Général')}
	onchange={(id) => actions.files.update(file.id, { featureId: id || null })}
	><FolderInput size={13} /></IconSelect
>
<ConfirmDelete onconfirm={() => actions.files.remove(file.id)} />
