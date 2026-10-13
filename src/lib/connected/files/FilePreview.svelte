<script lang="ts">
	import { Download, ExternalLink, X } from '@lucide/svelte';
	import { fileUrl } from '$lib/client/api';
	import { useApp } from '$lib/client/context';
	import { relativeTime } from '$lib/client/format';
	import { now } from '$lib/client/now.svelte';
	import { canPreview, fileKind, formatSize } from '$lib/modules/files/domain/file';
	import Button from '$lib/ui/atoms/Button.svelte';
	import FileIcon from '$lib/ui/atoms/FileIcon.svelte';
	import IconButton from '$lib/ui/atoms/IconButton.svelte';
	import IconLink from '$lib/ui/atoms/IconLink.svelte';

	const { app, overlays } = useApp();
	const file = $derived(app.files.get(overlays.previewFileId));
	const kind = $derived(file ? fileKind(file.mime, file.name) : 'other');
	const uploader = $derived(app.users.get(file?.uploadedBy));
	let dialog = $state<HTMLDialogElement>();
	let text = $state<string | null>(null);

	$effect(() => {
		if (!dialog) return;
		if (file && !dialog.open) dialog.showModal();
		if (!file && dialog.open) dialog.close();
	});

	$effect(() => {
		text = null;
		if (!file || kind !== 'text') return;
		const id = file.id;
		fetch(fileUrl(id), { headers: { range: 'bytes=0-200000' } })
			.then((r) => r.text())
			.then((content) => overlays.previewFileId === id && (text = content))
			.catch(() => (text = 'Impossible de lire ce fichier.'));
	});
</script>

<dialog
	bind:this={dialog}
	onclose={() => (overlays.previewFileId = null)}
	onclick={(e) => e.target === dialog && dialog?.close()}
	class="m-auto h-[min(92dvh,900px)] w-[min(96vw,1100px)] max-w-none overflow-hidden rounded-2xl border border-line bg-surface p-0 shadow-pop open:flex open:animate-pop open:flex-col"
	aria-label="Aperçu du fichier"
>
	{#if file}
		<header class="flex items-center gap-3 border-b border-line px-4 py-3">
			<FileIcon {kind} size={16} />
			<div class="min-w-0 flex-1">
				<p class="truncate text-base font-semibold">{file.name}</p>
				<p class="truncate text-sm text-ink-3">
					{formatSize(file.size)} · {uploader?.name ?? 'Quelqu’un'}, {relativeTime(
						file.createdAt,
						now.value
					)}
				</p>
			</div>
			<Button size="sm" icon={Download} href={fileUrl(file.id, true)}>Télécharger</Button>
			<IconLink
				href={fileUrl(file.id)}
				target="_blank"
				rel="noopener"
				icon={ExternalLink}
				label="Ouvrir dans un onglet"
				class="hidden sm:inline-flex"
			/>
			<IconButton icon={X} label="Fermer" onclick={() => dialog?.close()} />
		</header>
		<div class="flex min-h-0 flex-1 items-center justify-center bg-sunken">
			{#if kind === 'image'}
				<img src={fileUrl(file.id)} alt={file.name} class="max-h-full max-w-full object-contain" />
			{:else if kind === 'video'}
				<!-- svelte-ignore a11y_media_has_caption -->
				<video src={fileUrl(file.id)} controls class="max-h-full max-w-full"></video>
			{:else if kind === 'audio'}
				<audio src={fileUrl(file.id)} controls class="w-[min(90%,480px)]"></audio>
			{:else if kind === 'pdf'}
				<iframe src={fileUrl(file.id)} title={file.name} class="h-full w-full bg-white"></iframe>
			{:else if kind === 'text'}
				<pre
					class="h-full w-full scrollbar-thin overflow-auto bg-surface p-5 font-mono text-sm leading-relaxed whitespace-pre-wrap text-ink">{text ??
						'Chargement…'}</pre>
			{:else}
				<div class="flex flex-col items-center gap-3 p-8 text-center">
					<FileIcon {kind} size={28} />
					<p class="text-base text-ink-2">
						{canPreview(kind) ? '' : 'Pas d’aperçu pour ce type de fichier.'}
					</p>
					<Button variant="primary" icon={Download} href={fileUrl(file.id, true)}
						>Télécharger</Button
					>
				</div>
			{/if}
		</div>
	{/if}
</dialog>
