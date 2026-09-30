<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Upload } from '@lucide/svelte';

	interface Props {
		onfiles: (files: File[]) => void;
		label: string;
		children: Snippet;
	}

	let { onfiles, label, children }: Props = $props();
	// dragenter/dragleave fire for every child crossed: a depth counter tells when we really left.
	let depth = $state(0);
	const carriesFiles = (event: DragEvent) => event.dataTransfer?.types.includes('Files') ?? false;

	function drop(event: DragEvent) {
		event.preventDefault();
		depth = 0;
		const files = [...(event.dataTransfer?.files ?? [])];
		if (files.length) onfiles(files);
	}
</script>

<div
	role="region"
	aria-label="Zone de dépôt"
	class="relative min-h-[50vh]"
	ondragenter={(event) => carriesFiles(event) && (event.preventDefault(), depth++)}
	ondragover={(event) => carriesFiles(event) && event.preventDefault()}
	ondragleave={() => (depth = Math.max(0, depth - 1))}
	ondrop={drop}
>
	{@render children()}
	{#if depth > 0}
		<div
			class="pointer-events-none absolute -inset-3 z-30 flex animate-rise justify-center rounded-xl border-2 border-dashed border-accent bg-accent-soft/85 text-accent backdrop-blur-[2px]"
		>
			<!-- Sticky so the hint stays in view over a long list of files. -->
			<div class="sticky top-[30vh] mt-[12vh] flex flex-col items-center gap-3 self-start">
				<span class="flex size-12 items-center justify-center rounded-full bg-surface shadow-pop"
					><Upload size={20} /></span
				>
				<p class="font-display text-[28px] leading-none text-ink">Déposer ici</p>
				<p class="text-[13px]">{label}</p>
			</div>
		</div>
	{/if}
</div>
