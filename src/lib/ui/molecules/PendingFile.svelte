<script lang="ts">
	import Spinner from '../atoms/Spinner.svelte';

	let { name, size }: { name: string; size: string } = $props();
</script>

<div
	class="animate-rise overflow-hidden rounded-lg border border-dashed border-accent/50 bg-surface"
>
	<div class="flex aspect-[4/3] flex-col items-center justify-center gap-2 bg-accent-soft/40">
		<Spinner size={18} />
		<span class="text-xs text-accent">Envoi…</span>
	</div>
	<div class="px-3 py-2.5">
		<p class="truncate text-sm font-medium">{name}</p>
		<p class="mt-0.5 font-mono text-2xs text-ink-3">{size}</p>
	</div>
</div>
