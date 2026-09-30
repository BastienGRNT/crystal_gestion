<script lang="ts">
	import { useProject } from '$lib/client/context';
	import FilePickButton from '$lib/ui/molecules/FilePickButton.svelte';

	interface Props {
		folder: { label: string; count: number; ref?: string };
		onfiles: (files: File[]) => void;
	}

	let { folder, onfiles }: Props = $props();
	const { store } = useProject();
	const countLabel = (n: number) => (n ? `${n} fichier${n > 1 ? 's' : ''}` : 'Aucun fichier');
</script>

<div class="mb-4 flex flex-wrap items-center justify-between gap-3 md:items-end">
	<div class="min-w-0">
		<p class="flex items-center gap-2 font-mono text-[11px] text-ink-3">
			{#if folder.ref}
				<a href="/p/{store.project.slug}/features/{folder.ref}" class="transition hover:text-accent"
					>{folder.ref}</a
				>
				<span>·</span>
			{/if}
			{countLabel(folder.count)}
		</p>
		<h2 class="hidden truncate font-display text-[30px] leading-tight md:block">{folder.label}</h2>
	</div>
	<FilePickButton {onfiles} />
</div>
