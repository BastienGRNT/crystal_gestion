<script lang="ts">
	import { untrack } from 'svelte';
	import { useProject } from '$lib/client/context';
	import { sameLocation } from '$lib/modules/files/domain/folder';
	import DropZone from '$lib/ui/organisms/DropZone.svelte';
	import FolderList from '$lib/ui/molecules/FolderList.svelte';
	import FileGrid from './FileGrid.svelte';
	import FolderHeader from './FolderHeader.svelte';
	import { folderFeatureId, folders, GENERAL_FOLDER } from './options';
	import { UploadQueue } from './uploads.svelte';

	/** `initial`: the folder to open first (a feature id), e.g. from a feature page. */
	let { initial = GENERAL_FOLDER }: { initial?: string } = $props();
	const { store, actions } = useProject();
	const queue = new UploadQueue(actions.files.upload);
	let selected = $state(untrack(() => initial));
	let openId = $state<string | null>(null);
	const list = $derived(folders(store.features.items, store.files.items));
	// A deleted feature takes its folder with it: fall back to "Général" instead of an empty view.
	const current = $derived(list.find((folder) => folder.id === selected) ?? list[0]);
	const featureId = $derived(folderFeatureId(current.id));
	// Same for a sub-folder deleted meanwhile: back to the root.
	const opened = $derived(openId ? store.folders.get(openId) : undefined);
	const location = $derived({
		featureId,
		folderId: opened?.featureId === featureId ? opened.id : null
	});
	const upload = (files: File[]) => queue.add(files, location);
	const open = (id: string | null) => (openId = id);
</script>

<DropZone onfiles={upload} label="Dans le dossier « {opened?.name ?? current.label} »">
	<div class="grid gap-5 md:grid-cols-[12.5rem_1fr] md:gap-8">
		<aside class="md:sticky md:top-6 md:self-start">
			<p class="mb-2 hidden px-2 text-2xs font-medium tracking-wide text-ink-3 uppercase md:block">
				Dossiers
			</p>
			<FolderList
				folders={list}
				selected={current.id}
				onselect={(id) => ((selected = id), (openId = null))}
			/>
		</aside>
		<section class="min-w-0">
			<FolderHeader root={current} {location} onopen={open} onfiles={upload} />
			<FileGrid
				{location}
				pending={queue.pending.filter((item) => sameLocation(item.location, location))}
				onfiles={upload}
				onopen={open}
			/>
		</section>
	</div>
</DropZone>
