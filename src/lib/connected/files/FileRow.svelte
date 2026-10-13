<script lang="ts">
	import { Download, Ellipsis, FolderInput, MessagesSquare, Pencil, Trash2 } from '@lucide/svelte';
	import { fileUrl } from '$lib/client/api';
	import { useApp } from '$lib/client/context';
	import { dnd } from '$lib/client/dnd.svelte';
	import { relativeTime } from '$lib/client/format';
	import { now } from '$lib/client/now.svelte';
	import { fileKind, formatSize, type StoredFile } from '$lib/modules/files/domain/file';
	import Avatar from '$lib/ui/atoms/Avatar.svelte';
	import FileIcon from '$lib/ui/atoms/FileIcon.svelte';
	import IconButton from '$lib/ui/atoms/IconButton.svelte';
	import IconLink from '$lib/ui/atoms/IconLink.svelte';
	import Menu from '$lib/ui/molecules/Menu.svelte';

	let {
		file,
		path = null,
		onmove
	}: { file: StoredFile; path?: string | null; onmove: () => void } = $props();
	const { app, actions, overlays } = useApp();
	const kind = $derived(fileKind(file.mime, file.name));
	const uploader = $derived(app.users.get(file.uploadedBy));
	let renaming = $state(false);
	let name = $state('');
</script>

<li
	{@attach dnd.draggable(file.id, 'files')}
	class="group flex min-h-16 items-center gap-3 bg-surface px-3 py-2.5 hover:bg-surface-2 sm:px-4"
>
	{#if kind === 'image'}
		<img
			src={fileUrl(file.id)}
			alt=""
			loading="lazy"
			class="size-10 shrink-0 rounded-lg border border-line object-cover"
		/>
	{:else}
		<FileIcon {kind} />
	{/if}
	<div class="min-w-0 flex-1">
		{#if renaming}
			<input
				bind:value={name}
				aria-label="Nouveau nom"
				class="h-10 w-full rounded-lg border border-accent bg-surface px-3 text-base ring-4 ring-accent-soft outline-none"
				onkeydown={(e) => {
					if (e.key === 'Enter') e.currentTarget.blur();
					if (e.key === 'Escape') renaming = false;
				}}
				onblur={() => {
					if (renaming) actions.files.rename(file.id, name);
					renaming = false;
				}}
				{@attach (node) => node.select()}
			/>
		{:else}
			<button
				data-drag-handle
				class="block max-w-full truncate text-left text-base font-medium hover:underline"
				onclick={() => (overlays.previewFileId = file.id)}
			>
				{file.name}
			</button>
		{/if}
		<p class="flex items-center gap-1.5 truncate text-sm text-ink-3">
			{#if uploader}<Avatar name={uploader.name} color={uploader.color} size="xs" />{/if}
			<span class="truncate"
				>{formatSize(file.size)} · {relativeTime(file.createdAt, now.value)}{path
					? ` · ${path}`
					: ''}</span
			>
			{#if file.messageId}<MessagesSquare
					size={13}
					class="shrink-0"
					aria-label="Partagé dans la discussion"
				/>{/if}
		</p>
	</div>
	<IconLink href={fileUrl(file.id, true)} icon={Download} label="Télécharger {file.name}" />
	<Menu
		label="Options du fichier"
		items={[
			{ label: 'Renommer', icon: Pencil, run: () => ((name = file.name), (renaming = true)) },
			{ label: 'Déplacer vers…', icon: FolderInput, run: onmove },
			'separator',
			{ label: 'Supprimer', icon: Trash2, danger: true, run: () => actions.files.remove(file.id) }
		]}
	>
		{#snippet trigger({ props })}<IconButton
				icon={Ellipsis}
				label="Options du fichier"
				{...props}
			/>{/snippet}
	</Menu>
</li>
