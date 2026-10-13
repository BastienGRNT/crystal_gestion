<script lang="ts">
	import {
		File,
		FileArchive,
		FileMusic,
		FileCode,
		FileImage,
		FileSpreadsheet,
		FileText,
		FilePlay,
		PenTool,
		Presentation
	} from '@lucide/svelte';
	import type { FileKind } from '$lib/modules/files/domain/file';

	let { kind, size = 18 }: { kind: FileKind; size?: number } = $props();

	const ICONS = {
		image: { icon: FileImage, tone: 'text-plan-text bg-plan-soft' },
		video: { icon: FilePlay, tone: 'text-now-text bg-now-soft' },
		audio: { icon: FileMusic, tone: 'text-accent-text bg-accent-soft' },
		pdf: { icon: FileText, tone: 'text-danger-text bg-danger-soft' },
		text: { icon: FileCode, tone: 'text-ink-2 bg-sunken' },
		sheet: { icon: FileSpreadsheet, tone: 'text-ok-text bg-ok-soft' },
		slides: { icon: Presentation, tone: 'text-delegate-text bg-delegate-soft' },
		doc: { icon: FileText, tone: 'text-plan-text bg-plan-soft' },
		archive: { icon: FileArchive, tone: 'text-warn-text bg-later-soft' },
		design: { icon: PenTool, tone: 'text-accent-text bg-accent-soft' },
		other: { icon: File, tone: 'text-ink-3 bg-sunken' }
	} as const;

	const tone = $derived(ICONS[kind].tone);
	const Icon = $derived(ICONS[kind].icon);
</script>

<span
	class={['flex shrink-0 items-center justify-center rounded-lg', tone]}
	style:width="{size + 18}px"
	style:height="{size + 18}px"
>
	<Icon {size} aria-hidden="true" />
</span>
