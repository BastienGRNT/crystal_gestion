<script lang="ts">
	import { FolderOpen } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import { formatSize } from '$lib/modules/files/domain/project-file';
	import EmptyState from '$lib/ui/molecules/EmptyState.svelte';
	import FilePickButton from '$lib/ui/molecules/FilePickButton.svelte';
	import PendingFile from '$lib/ui/molecules/PendingFile.svelte';
	import FileCard from './FileCard.svelte';
	import type { PendingUpload } from './uploads.svelte';

	interface Props {
		featureId: string | null;
		pending: PendingUpload[];
		onfiles: (files: File[]) => void;
	}

	let { featureId, pending, onfiles }: Props = $props();
	const { store } = useProject();
	const files = $derived(
		store.files.items
			.filter((file) => file.featureId === featureId)
			.toSorted((a, b) => b.createdAt.localeCompare(a.createdAt))
	);
</script>

{#if files.length || pending.length}
	<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
		{#each pending as item (item.id)}<PendingFile
				name={item.name}
				size={formatSize(item.size)}
			/>{/each}
		{#each files as file (file.id)}<FileCard {file} />{/each}
	</div>
{:else}
	<EmptyState
		icon={FolderOpen}
		title="Dossier vide"
		text="Glisse des fichiers n’importe où ici, ou choisis-les. Images, PDF, vidéos et textes s’ouvrent en aperçu (50 Mo max)."
	>
		<FilePickButton {onfiles} label="Choisir des fichiers" variant="secondary" />
	</EmptyState>
{/if}
