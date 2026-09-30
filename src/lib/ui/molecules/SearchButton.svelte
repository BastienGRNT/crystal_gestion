<script lang="ts">
	import { Search } from '@lucide/svelte';
	import Kbd from '../atoms/Kbd.svelte';

	let { onclick }: { onclick: () => void } = $props();
</script>

<button
	{onclick}
	class="flex h-8 w-full items-center gap-2 rounded-md border border-line bg-surface/70 px-2.5 text-[13px] text-ink-3 transition hover:border-line-strong hover:text-ink-2"
>
	<Search size={14} />
	<span class="flex-1 text-left">Rechercher…</span>
	<Kbd>⌘K</Kbd>
</button>
