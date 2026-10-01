<script lang="ts">
	import { FolderOpen } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import { contentsOf, type FileLocation } from '$lib/modules/files/domain/folder';
	import { formatSize } from '$lib/modules/files/domain/project-file';
	import EmptyState from '$lib/ui/molecules/EmptyState.svelte';
	import FilePickButton from '$lib/ui/molecules/FilePickButton.svelte';
	import FolderCard from '$lib/ui/molecules/FolderCard.svelte';
	import PendingFile from '$lib/ui/molecules/PendingFile.svelte';
	import FileCard from './FileCard.svelte';
	import type { PendingUpload } from './uploads.svelte';

	interface Props {
		location: FileLocation;
		pending: PendingUpload[];
		onfiles: (files: File[]) => void;
		onopen: (folderId: string) => void;
	}

	let { location, pending, onfiles, onopen }: Props = $props();
	const { store } = useProject();
	const here = $derived(contentsOf(location, store.files.items, store.folders.items));
	const files = $derived(here.files.toSorted((a, b) => b.createdAt.localeCompare(a.createdAt)));
	const countIn = (folderId: string) => {
		const inside = contentsOf({ ...location, folderId }, store.files.items, store.folders.items);
		return inside.files.length + inside.folders.length;
	};
</script>

{#if here.folders.length}
	<div class="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
		{#each here.folders as folder (folder.id)}
			<FolderCard name={folder.name} count={countIn(folder.id)} onopen={() => onopen(folder.id)} />
		{/each}
	</div>
{/if}
{#if files.length || pending.length}
	<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
		{#each pending as item (item.id)}<PendingFile
				name={item.name}
				size={formatSize(item.size)}
			/>{/each}
		{#each files as file (file.id)}<FileCard {file} />{/each}
	</div>
{:else if !here.folders.length}
	<EmptyState
		icon={FolderOpen}
		title="Dossier vide"
		text="Glisse des fichiers n’importe où ici, ou choisis-les. Images, PDF, vidéos et textes s’ouvrent en aperçu (50 Mo max)."
	>
		<FilePickButton {onfiles} label="Choisir des fichiers" variant="secondary" />
	</EmptyState>
{/if}
