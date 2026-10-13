<script lang="ts">
	import { Folder, FolderRoot } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import { subtree, type Folder as FolderType } from '$lib/modules/files/domain/folder';
	import Dialog from '$lib/ui/molecules/Dialog.svelte';

	interface Props {
		open: boolean;
		projectId: string;
		/** What moves: a file, or a folder (which cannot go inside itself). */
		item: { kind: 'file' | 'folder'; id: string; name: string } | null;
	}

	let { open = $bindable(), projectId, item }: Props = $props();
	const { app, actions } = useApp();
	const folders = $derived(
		app.folders.all.filter((f) => f.projectId === projectId && f.system === null)
	);
	const excluded = $derived(
		item?.kind === 'folder' ? new Set(subtree(app.folders.all, item.id)) : new Set<string>()
	);

	/** Depth-first, so the list reads like a tree. */
	const tree = $derived.by(() => {
		const rows: { folder: FolderType; depth: number }[] = [];
		const walk = (parentId: string | null, depth: number) => {
			for (const folder of folders
				.filter((f) => f.parentId === parentId)
				.sort((a, b) => a.name.localeCompare(b.name))) {
				if (excluded.has(folder.id)) continue;
				rows.push({ folder, depth });
				walk(folder.id, depth + 1);
			}
		};
		walk(null, 0);
		return rows;
	});

	function move(target: string | null) {
		if (!item) return;
		if (item.kind === 'file') actions.files.move(item.id, target);
		else actions.files.moveFolder(item.id, target);
		open = false;
	}
</script>

<Dialog
	bind:open
	size="sm"
	title="Déplacer « {item?.name ?? ''} »"
	description="Choisis le dossier où le ranger."
>
	<ul class="flex flex-col">
		<li>
			<button
				class="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-base hover:bg-hover"
				onclick={() => move(null)}
			>
				<FolderRoot size={18} class="text-ink-3" /> Documents (racine)
			</button>
		</li>
		{#each tree as row (row.folder.id)}
			<li>
				<button
					class="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-base hover:bg-hover"
					style:padding-left="{12 + (row.depth + 1) * 20}px"
					onclick={() => move(row.folder.id)}
				>
					<Folder size={18} class="text-plan-text" />
					{row.folder.name}
				</button>
			</li>
		{/each}
	</ul>
</Dialog>
