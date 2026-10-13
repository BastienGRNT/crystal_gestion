<script lang="ts">
	import { Ellipsis, Folder, FolderInput, MessagesSquare, Pencil, Trash2 } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import { dnd } from '$lib/client/dnd.svelte';
	import { plural } from '$lib/client/format';
	import { subtree, type Folder as FolderType } from '$lib/modules/files/domain/folder';
	import IconButton from '$lib/ui/atoms/IconButton.svelte';
	import Menu from '$lib/ui/molecules/Menu.svelte';

	interface Props {
		folder: FolderType;
		onopen: () => void;
		ondrop: (itemId: string) => void;
		onrename: () => void;
		onmove: () => void;
		onremove: () => void;
	}

	let { folder, onopen, ondrop, onrename, onmove, onremove }: Props = $props();
	const { app } = useApp();
	const count = $derived.by(() => {
		const ids = new Set(subtree(app.folders.all, folder.id));
		return app.files.all.filter((f) => f.folderId && ids.has(f.folderId)).length;
	});
	const over = $derived(dnd.over?.zone === `folder:${folder.id}`);
	const system = $derived(folder.system !== null);
</script>

<div
	{@attach dnd.dropzone(`folder:${folder.id}`, (id) => ondrop(id))}
	class={[
		'group relative rounded-2xl border bg-surface shadow-card transition-all',
		over ? 'border-accent ring-4 ring-accent-soft' : 'border-line hover:border-line-strong'
	]}
>
	<div {@attach system ? () => {} : dnd.draggable(folder.id, 'folders')}>
		<button onclick={onopen} data-drag-handle class="flex w-full items-center gap-3 p-4 text-left">
			<span
				class={[
					'flex size-11 shrink-0 items-center justify-center rounded-xl',
					system ? 'bg-accent-soft text-accent-text' : 'bg-plan-soft text-plan-text'
				]}
			>
				{#if system}<MessagesSquare size={20} />{:else}<Folder size={20} />{/if}
			</span>
			<span class="min-w-0 flex-1">
				<span class="block truncate text-base font-semibold">{folder.name}</span>
				<span class="block text-sm text-ink-3">{count ? plural(count, 'fichier') : 'Vide'}</span>
			</span>
		</button>
	</div>
	{#if !system}
		<div
			class="absolute top-3 right-2 opacity-100 sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100"
		>
			<Menu
				label="Options du dossier"
				items={[
					{ label: 'Renommer', icon: Pencil, run: onrename },
					{ label: 'Déplacer vers…', icon: FolderInput, run: onmove },
					'separator',
					{
						label: 'Supprimer le dossier et son contenu',
						icon: Trash2,
						danger: true,
						run: onremove
					}
				]}
			>
				{#snippet trigger({ props })}<IconButton
						icon={Ellipsis}
						label="Options du dossier"
						size="sm"
						{...props}
					/>{/snippet}
			</Menu>
		</div>
	{/if}
</div>
