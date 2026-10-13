<script lang="ts">
	import { ChevronRight, FolderOpen, FolderPlus, Search, Upload } from '@lucide/svelte';
	import { untrack } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { uploads } from '$lib/client/actions/files.svelte';
	import { useApp } from '$lib/client/context';
	import { dnd } from '$lib/client/dnd.svelte';
	import { score } from '$lib/client/views/search';
	import { fileKind } from '$lib/modules/files/domain/file';
	import { pathTo } from '$lib/modules/files/domain/folder';
	import type { Project } from '$lib/modules/projects/domain/project';
	import Button from '$lib/ui/atoms/Button.svelte';
	import TextInput from '$lib/ui/atoms/TextInput.svelte';
	import Dialog from '$lib/ui/molecules/Dialog.svelte';
	import EmptyState from '$lib/ui/molecules/EmptyState.svelte';
	import PageHeader from '$lib/ui/organisms/PageHeader.svelte';
	import DropZone from './DropZone.svelte';
	import FileRow from './FileRow.svelte';
	import FolderCard from './FolderCard.svelte';
	import { FILE_FILTERS } from './kinds';
	import MoveDialog from './MoveDialog.svelte';

	let { project }: { project: Project } = $props();
	const { app, actions, overlays } = useApp();
	let query = $state('');
	let filter = $state('all');
	let picker = $state<HTMLInputElement>();
	let moving = $state<{ kind: 'file' | 'folder'; id: string; name: string } | null>(null);
	let naming = $state<{ folderId: string | null; name: string } | null>(null);

	const folderId = $derived(page.url.searchParams.get('dossier'));
	const folders = $derived(app.folders.all.filter((f) => f.projectId === project.id));
	const current = $derived(folders.find((f) => f.id === folderId) ?? null);
	const crumbs = $derived(pathTo(folders, current?.id ?? null));
	const files = $derived(app.files.all.filter((f) => f.projectId === project.id));
	const kinds = $derived(FILE_FILTERS.find((f) => f.key === filter)?.kinds ?? null);
	const searching = $derived(query.trim().length > 0 || filter !== 'all');
	const subfolders = $derived(
		folders
			.filter((f) => f.parentId === (current?.id ?? null))
			.sort(
				(a, b) =>
					Number(b.system !== null) - Number(a.system !== null) || a.name.localeCompare(b.name)
			)
	);
	// Searching looks in every folder of the project; otherwise only here.
	const shown = $derived(
		files
			.filter((f) => (searching ? true : f.folderId === (current?.id ?? null)))
			.filter(
				(f) => (!kinds || kinds.includes(fileKind(f.mime, f.name))) && score(f.name, query) !== null
			)
			.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
	);
	const sending = $derived(uploads.items.filter((u) => u.projectId === project.id));
	const base = $derived(`/p/${project.slug}/documents`);

	$effect(() => {
		const id = page.url.searchParams.get('fichier');
		if (id) untrack(() => (overlays.previewFileId = id));
	});

	const open = (id: string | null) =>
		goto(id ? `${base}?dossier=${id}` : base, { keepFocus: true, noScroll: true });
	const send = (list: File[]) =>
		list.forEach((file) => actions.files.upload(file, project.id, current?.id ?? null));
	const pathOf = (id: string | null) =>
		pathTo(folders, id)
			.map((f) => f.name)
			.join(' / ') || 'Documents';

	/** A file or a folder dropped on a folder (or a crumb) moves into it. */
	function dropOn(target: string | null) {
		return (itemId: string) => {
			if (app.files.get(itemId)) actions.files.move(itemId, target);
			else if (app.folders.get(itemId) && itemId !== target)
				actions.files.moveFolder(itemId, target);
		};
	}

	function saveFolder(event: SubmitEvent) {
		event.preventDefault();
		if (!naming) return;
		if (naming.folderId) actions.files.renameFolder(naming.folderId, naming.name);
		else actions.files.createFolder(project.id, current?.id ?? null, naming.name);
		naming = null;
	}
</script>

<PageHeader
	title="Documents"
	subtitle="Tous les fichiers du projet, rangés en dossiers. Ceux partagés dans la discussion arrivent tout seuls dans leur dossier."
>
	{#snippet actions()}
		<Button icon={FolderPlus} onclick={() => (naming = { folderId: null, name: '' })}
			>Nouveau dossier</Button
		>
		<Button variant="primary" icon={Upload} onclick={() => picker?.click()}
			>Envoyer des fichiers</Button
		>
		<input
			bind:this={picker}
			type="file"
			multiple
			hidden
			onchange={(e) => (send([...(e.currentTarget.files ?? [])]), (e.currentTarget.value = ''))}
		/>
	{/snippet}
</PageHeader>

<DropZone
	label="Lâche pour ranger dans « {current?.name ?? 'Documents'} »"
	ondrop={send}
	class="mx-auto max-w-6xl px-4 pb-12 sm:px-8"
>
	<div class="flex flex-col gap-5">
		<div class="flex flex-wrap items-center gap-2">
			<label class="relative w-full sm:w-80">
				<Search
					size={17}
					class="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-3"
					aria-hidden="true"
				/>
				<input
					bind:value={query}
					type="search"
					placeholder="Chercher dans tout le projet"
					class="h-11 w-full rounded-xl border border-line-strong/70 bg-surface pr-3 pl-10 text-base shadow-card outline-none focus:border-accent focus:ring-4 focus:ring-accent-soft"
				/>
			</label>
			<div class="flex flex-wrap gap-1">
				{#each FILE_FILTERS as option (option.key)}
					<button
						onclick={() => (filter = option.key)}
						aria-pressed={filter === option.key}
						class={[
							'h-10 rounded-full px-4 text-base font-medium transition-colors',
							filter === option.key ? 'bg-primary text-primary-ink' : 'text-ink-2 hover:bg-hover'
						]}>{option.label}</button
					>
				{/each}
			</div>
		</div>

		{#if !searching}
			<nav aria-label="Dossier ouvert" class="flex flex-wrap items-center gap-1 text-base">
				<button
					{@attach dnd.dropzone('folder:root', (id) => dropOn(null)(id))}
					onclick={() => open(null)}
					class={[
						'rounded-lg px-2 py-1 font-semibold hover:bg-hover',
						dnd.over?.zone === 'folder:root' && 'bg-accent-soft ring-2 ring-accent',
						current ? 'text-ink-3' : 'text-ink'
					]}>Documents</button
				>
				{#each crumbs as crumb (crumb.id)}
					<ChevronRight size={16} class="text-ink-4" />
					<button
						{@attach dnd.dropzone(`crumb:${crumb.id}`, (id) => dropOn(crumb.id)(id))}
						onclick={() => open(crumb.id)}
						class={[
							'rounded-lg px-2 py-1 font-semibold hover:bg-hover',
							crumb.id === current?.id ? 'text-ink' : 'text-ink-3',
							dnd.over?.zone === `crumb:${crumb.id}` && 'bg-accent-soft ring-2 ring-accent'
						]}>{crumb.name}</button
					>
				{/each}
			</nav>

			{#if subfolders.length}
				<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{#each subfolders as folder (folder.id)}
						<FolderCard
							{folder}
							onopen={() => open(folder.id)}
							ondrop={dropOn(folder.id)}
							onrename={() => (naming = { folderId: folder.id, name: folder.name })}
							onmove={() => (moving = { kind: 'folder', id: folder.id, name: folder.name })}
							onremove={() =>
								actions.files.removeFolder(
									folder.id,
									() => folder.id === current?.id && open(folder.parentId)
								)}
						/>
					{/each}
				</div>
			{/if}
		{/if}

		{#if sending.length}
			<ul class="flex flex-col gap-1.5">
				{#each sending as upload (upload.id)}
					<li
						class="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-2.5 text-base"
					>
						<span class="min-w-0 flex-1 truncate">{upload.name}</span>
						<span class="h-1.5 w-32 overflow-hidden rounded-full bg-sunken">
							<span
								class="block h-full rounded-full bg-accent transition-[width]"
								style:width="{Math.round(upload.progress * 100)}%"
							></span>
						</span>
						<span class="w-12 text-right text-sm text-ink-3 tabular-nums"
							>{Math.round(upload.progress * 100)} %</span
						>
					</li>
				{/each}
			</ul>
		{/if}

		{#if shown.length}
			<ul class="divide-y divide-line overflow-hidden rounded-2xl border border-line shadow-card">
				{#each shown as file (file.id)}
					<FileRow
						{file}
						path={searching ? pathOf(file.folderId) : null}
						onmove={() => (moving = { kind: 'file', id: file.id, name: file.name })}
					/>
				{/each}
			</ul>
			{#if !searching && subfolders.length}<p class="text-sm text-ink-3">
					Glisse un fichier sur un dossier pour l’y ranger.
				</p>{/if}
		{:else if searching}
			<EmptyState
				compact
				title="Aucun fichier ne correspond"
				text="Essaie un autre mot, ou enlève le filtre."
			/>
		{:else if !subfolders.length}
			<EmptyState
				icon={FolderOpen}
				title={current ? 'Ce dossier est vide' : 'Tous les fichiers du projet, au même endroit'}
				text="Glisse des fichiers ici depuis ton ordinateur, ou clique sur « Envoyer des fichiers ». Crée des dossiers pour ranger : maquettes, contrats, compta…"
			>
				<Button icon={Upload} onclick={() => picker?.click()}>Envoyer des fichiers</Button>
			</EmptyState>
		{/if}
	</div>
</DropZone>

<MoveDialog
	bind:open={() => moving !== null, (value) => !value && (moving = null)}
	projectId={project.id}
	item={moving}
/>

<Dialog
	bind:open={() => naming !== null, (value) => !value && (naming = null)}
	size="sm"
	title={naming?.folderId ? 'Renommer le dossier' : 'Nouveau dossier'}
	description={naming?.folderId ? undefined : `Dans « ${current?.name ?? 'Documents'} ».`}
>
	{#if naming}
		<form id="folder-form" onsubmit={saveFolder}>
			<TextInput
				bind:value={naming.name}
				aria-label="Nom du dossier"
				placeholder="Ex. : Maquettes"
				required
				maxlength={60}
				autofocus
			/>
		</form>
	{/if}
	{#snippet footer()}
		<Button variant="ghost" onclick={() => (naming = null)}>Annuler</Button>
		<Button type="submit" form="folder-form" variant="primary"
			>{naming?.folderId ? 'Renommer' : 'Créer'}</Button
		>
	{/snippet}
</Dialog>
