<script lang="ts">
	import { Upload } from '@lucide/svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		label: string;
		ondrop: (files: File[]) => void;
		children: Snippet;
		class?: string;
	}

	let { label, ondrop, children, class: extra = '' }: Props = $props();
	let depth = $state(0);
	const hasFiles = (e: DragEvent) => e.dataTransfer?.types.includes('Files') ?? false;
</script>

<!-- Files dragged from the computer anywhere over this area are uploaded. -->
<div
	role="region"
	aria-label={label}
	class={['relative', extra]}
	ondragenter={(e) => hasFiles(e) && (e.preventDefault(), depth++)}
	ondragover={(e) => hasFiles(e) && e.preventDefault()}
	ondragleave={(e) => hasFiles(e) && (depth = Math.max(0, depth - 1))}
	ondrop={(e) => {
		if (!hasFiles(e)) return;
		e.preventDefault();
		depth = 0;
		ondrop([...(e.dataTransfer?.files ?? [])]);
	}}
>
	{@render children()}
	{#if depth > 0}
		<div
			class="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-2xl border-2 border-dashed border-accent bg-accent-soft/80 backdrop-blur-sm"
		>
			<p class="flex items-center gap-2 text-md font-semibold text-accent-text">
				<Upload size={18} />{label}
			</p>
		</div>
	{/if}
</div>
