<script lang="ts">
	import { File, FileAudio, FileImage, FileText, FileVideo } from '@lucide/svelte';
	import type { PreviewKind } from '$lib/modules/files/domain/project-file';

	interface Props {
		kind: PreviewKind | null;
		name: string;
		src?: string;
	}

	let { kind, name, src }: Props = $props();
	const icons = {
		image: FileImage,
		pdf: FileText,
		text: FileText,
		video: FileVideo,
		audio: FileAudio
	};
	const Icon = $derived(kind ? icons[kind] : File);
	const extension = $derived(name.includes('.') ? name.split('.').pop()?.slice(0, 5) : '');
</script>

<div class="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-sunken">
	{#if kind === 'image' && src}
		<img {src} alt="" loading="lazy" class="size-full object-cover" />
	{:else}
		<div class="flex flex-col items-center gap-2 text-ink-3">
			<Icon size={28} strokeWidth={1.4} />
			{#if extension}<span class="font-mono text-[10.5px] tracking-widest uppercase"
					>{extension}</span
				>{/if}
		</div>
	{/if}
</div>
