<script lang="ts">
	import { ChevronRight } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import { contentsOf, folderPath, type FileLocation } from '$lib/modules/files/domain/folder';
	import DeleteButton from '$lib/ui/atoms/DeleteButton.svelte';
	import FilePickButton from '$lib/ui/molecules/FilePickButton.svelte';
	import InlineCreate from '$lib/ui/molecules/InlineCreate.svelte';
	import InlineText from '$lib/ui/molecules/InlineText.svelte';

	interface Props {
		root: { label: string; ref?: string };
		location: FileLocation;
		onopen: (folderId: string | null) => void;
		onfiles: (files: File[]) => void;
	}

	let { root, location, onopen, onfiles }: Props = $props();
	const { store, actions } = useProject();
	const path = $derived(folderPath(store.folders.items, location.folderId));
	const folder = $derived(path.at(-1));
	const empty = $derived.by(() => {
		const inside = contentsOf(location, store.files.items, store.folders.items);
		return !inside.files.length && !inside.folders.length;
	});

	function remove() {
		if (!folder) return;
		const { id, parentId } = folder;
		actions.folders.remove(id);
		onopen(parentId);
	}
</script>

<div class="mb-4 flex flex-wrap items-center justify-between gap-3 md:items-end">
	<div class="min-w-0 flex-1">
		<nav
			aria-label="Chemin du dossier"
			class="flex flex-wrap items-center gap-1 text-xs text-ink-3"
		>
			{#if root.ref}
				<a
					href="/p/{store.project.slug}/features/{root.ref}"
					class="font-mono transition hover:text-accent">{root.ref}</a
				>
				<span>·</span>
			{/if}
			<button type="button" onclick={() => onopen(null)} class="transition hover:text-accent"
				>{root.label}</button
			>
			{#each path.slice(0, -1) as parent (parent.id)}
				<ChevronRight size={12} />
				<button type="button" onclick={() => onopen(parent.id)} class="transition hover:text-accent"
					>{parent.name}</button
				>
			{/each}
		</nav>
		{#if folder}
			<InlineText
				value={folder.name}
				onsave={(name) => actions.folders.rename(folder.id, name)}
				class="truncate font-display text-3xl leading-tight"
			/>
		{:else}
			<h2 class="hidden truncate font-display text-3xl leading-tight md:block">{root.label}</h2>
		{/if}
	</div>
	<div class="flex items-center gap-2">
		{#if folder && empty}<DeleteButton label="Supprimer ce dossier vide" onconfirm={remove} />{/if}
		<div class="w-44">
			<InlineCreate
				label="Nouveau dossier"
				placeholder="Nom, puis Entrée"
				oncreate={(name) =>
					actions.folders.create({
						featureId: location.featureId,
						parentId: location.folderId,
						name
					})}
			/>
		</div>
		<FilePickButton {onfiles} />
	</div>
</div>
