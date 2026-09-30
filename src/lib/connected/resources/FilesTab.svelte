<script lang="ts">
	import { useProject } from '$lib/client/context';
	import DropZone from '$lib/ui/organisms/DropZone.svelte';
	import FolderList from '$lib/ui/molecules/FolderList.svelte';
	import FileGrid from './FileGrid.svelte';
	import FolderHeader from './FolderHeader.svelte';
	import { folderFeatureId, folders, GENERAL_FOLDER } from './options';
	import { UploadQueue } from './uploads.svelte';

	const { store, actions } = useProject();
	const queue = new UploadQueue(actions.files.upload);
	let selected = $state(GENERAL_FOLDER);
	const list = $derived(folders(store.features.items, store.files.items));
	// A deleted feature takes its folder with it: fall back to "Général" instead of an empty view.
	const current = $derived(list.find((folder) => folder.id === selected) ?? list[0]);
	const featureId = $derived(folderFeatureId(current.id));
	const upload = (files: File[]) => queue.add(files, featureId);
</script>

<DropZone onfiles={upload} label="Dans le dossier « {current.label} »">
	<div class="grid gap-5 md:grid-cols-[12.5rem_1fr] md:gap-8">
		<aside class="md:sticky md:top-6 md:self-start">
			<p class="mb-2 hidden px-2 text-2xs font-medium tracking-wide text-ink-3 uppercase md:block">
				Dossiers
			</p>
			<FolderList folders={list} selected={current.id} onselect={(id) => (selected = id)} />
		</aside>
		<section class="min-w-0">
			<FolderHeader folder={current} onfiles={upload} />
			<FileGrid
				{featureId}
				pending={queue.pending.filter((item) => item.featureId === featureId)}
				onfiles={upload}
			/>
		</section>
	</div>
</DropZone>
