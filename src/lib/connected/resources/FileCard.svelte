<script lang="ts">
	import { useProject } from '$lib/client/context';
	import { formatDay } from '$lib/client/format';
	import {
		formatSize,
		previewKind,
		type ProjectFile
	} from '$lib/modules/files/domain/project-file';
	import FileThumb from '$lib/ui/molecules/FileThumb.svelte';
	import InlineText from '$lib/ui/molecules/InlineText.svelte';
	import FileTools from './FileTools.svelte';
	import { fileUrl } from './options';

	let { file }: { file: ProjectFile } = $props();
	const { store, actions, peek } = useProject();
	const author = $derived(store.members.get(file.createdBy ?? '')?.name ?? 'Inconnu');
</script>

<article
	class="group relative animate-rise overflow-hidden rounded-lg border border-line bg-surface transition hover:border-line-strong"
>
	<button
		type="button"
		class="block w-full"
		onclick={() => peek(file.ref)}
		aria-label="Aperçu de {file.title}"
	>
		<FileThumb
			kind={previewKind(file.mimeType)}
			name={file.title}
			src={fileUrl(file.projectId, file.id)}
		/>
	</button>
	<div class="border-t border-line px-3 pt-2 pb-2.5">
		<InlineText
			value={file.title}
			onsave={(title) => actions.files.update(file.id, { title })}
			class="truncate text-sm font-medium"
		/>
		<p class="mt-0.5 flex items-center gap-1.5 truncate text-xs text-ink-3">
			<span class="font-mono text-2xs">{formatSize(file.size)}</span>·
			<span class="truncate">{author}</span>·
			<span class="shrink-0">{formatDay(file.createdAt, { day: 'numeric', month: 'short' })}</span>
		</p>
	</div>
	<div
		class="absolute top-2 right-2 flex items-center gap-0.5 rounded-md border border-line bg-surface p-0.5 shadow-sm transition md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100"
	>
		<FileTools {file} />
	</div>
</article>
