<script lang="ts">
	import { Download, FolderInput } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import type { ProjectFile } from '$lib/modules/files/domain/project-file';
	import IconLink from '$lib/ui/atoms/IconLink.svelte';
	import DeleteButton from '$lib/ui/atoms/DeleteButton.svelte';
	import IconSelect from '$lib/ui/molecules/IconSelect.svelte';
	import { decodeLocation, fileUrl, locationOptions, locationValue } from './options';

	let { file }: { file: ProjectFile } = $props();
	const { store, actions } = useProject();
</script>

<IconLink href="{fileUrl(file.projectId, file.id)}?download" label="Télécharger" download
	><Download size={13} /></IconLink
>
<IconSelect
	label="Déplacer vers…"
	value={locationValue(file)}
	options={locationOptions(store.features.items, store.folders.items)}
	onchange={(value) => actions.files.update(file.id, decodeLocation(value))}
	><FolderInput size={13} /></IconSelect
>
<DeleteButton onconfirm={() => actions.files.remove(file.id)} />
