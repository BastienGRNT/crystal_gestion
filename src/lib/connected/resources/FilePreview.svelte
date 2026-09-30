<script lang="ts">
	import { previewKind, type ProjectFile } from '$lib/modules/files/domain/project-file';
	import FileThumb from '$lib/ui/molecules/FileThumb.svelte';
	import { fileUrl } from './options';
	import TextPreview from './TextPreview.svelte';

	let { file }: { file: ProjectFile } = $props();
	const kind = $derived(previewKind(file.mimeType));
	const src = $derived(fileUrl(file.projectId, file.id));
</script>

<div class="overflow-hidden rounded-lg border border-line bg-sunken">
	{#if kind === 'image'}
		<img {src} alt={file.title} class="mx-auto max-h-[420px] w-auto object-contain" />
	{:else if kind === 'pdf'}
		<iframe {src} title={file.title} class="h-[480px] w-full bg-surface"></iframe>
	{:else if kind === 'video'}
		<!-- svelte-ignore a11y_media_has_caption -->
		<video {src} controls class="max-h-[420px] w-full bg-ink"></video>
	{:else if kind === 'audio'}
		<audio {src} controls class="w-full p-4"></audio>
	{:else if kind === 'text'}
		<TextPreview {src} />
	{:else}
		<FileThumb {kind} name={file.title} />
		<p class="border-t border-line px-4 py-2.5 text-center text-sm text-ink-3">
			Pas d’aperçu pour ce type de fichier : télécharge-le pour l’ouvrir.
		</p>
	{/if}
</div>
