<script lang="ts">
	import { Download } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import type { ElementSummary } from '$lib/modules/kernel/domain/element';
	import DeleteButton from '$lib/ui/atoms/DeleteButton.svelte';
	import InlineText from '$lib/ui/molecules/InlineText.svelte';
	import Backlinks from '../Backlinks.svelte';
	import FilePreview from '../resources/FilePreview.svelte';
	import FileProperties from '../resources/FileProperties.svelte';
	import { fileUrl } from '../resources/options';

	let { element, onclose }: { element: ElementSummary; onclose: () => void } = $props();
	const { store, actions } = useProject();
	const file = $derived(store.files.get(element.id));
</script>

{#if file}
	<FilePreview {file} />
	<div class="mt-5 flex items-start gap-3">
		<InlineText
			value={file.title}
			onsave={(title) => actions.files.update(file.id, { title })}
			class="font-display text-3xl leading-tight break-all"
		/>
		<span class="mt-2"
			><DeleteButton onconfirm={() => (actions.files.remove(file.id), onclose())} /></span
		>
	</div>
	<a
		href="{fileUrl(file.projectId, file.id)}?download"
		download
		class="mt-3 inline-flex h-7 items-center gap-1.5 rounded-md bg-accent px-2.5 text-sm font-medium text-accent-ink shadow-sm transition hover:brightness-110"
		><Download size={13} />Télécharger</a
	>
	<div class="mt-5 border-t border-line pt-3"><FileProperties {file} /></div>
	<div class="mt-6 border-t border-line pt-5"><Backlinks id={file.id} /></div>
{/if}
