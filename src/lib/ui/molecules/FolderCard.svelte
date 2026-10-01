<script lang="ts">
	import { Folder } from '@lucide/svelte';

	let { name, count, onopen }: { name: string; count: number; onopen: () => void } = $props();
</script>

<button
	type="button"
	onclick={onopen}
	class="flex min-h-12 animate-rise items-center gap-3 rounded-[16px] border-[1.5px] border-line bg-surface px-3 py-2.5 text-left transition hover:border-line-strong hover:shadow-pop"
>
	<Folder size={18} class="shrink-0 text-accent" />
	<span class="min-w-0 flex-1 truncate text-sm font-medium">{name}</span>
	<span class="font-mono text-2xs text-ink-3">{count}</span>
</button>
