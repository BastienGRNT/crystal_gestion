<script lang="ts">
	import { Plus } from '@lucide/svelte';

	let { label, onclick }: { label: string; onclick: () => void } = $props();
</script>

<button
	type="button"
	{onclick}
	class="flex h-10 w-full items-center gap-2 rounded-lg border border-dashed border-line-strong px-3.5 text-sm text-ink-3 transition hover:border-accent hover:bg-accent-soft/40 hover:text-accent"
>
	<Plus size={14} />{label}
</button>
