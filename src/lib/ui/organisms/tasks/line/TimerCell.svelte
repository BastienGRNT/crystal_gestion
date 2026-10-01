<script lang="ts">
	import { Pause, Play } from '@lucide/svelte';

	let { running, ontimer }: { running: boolean; ontimer: () => void } = $props();
</script>

<!-- Hidden until hover; while it runs, a quiet « chrono » marker that stops it on click. -->
<button
	type="button"
	onclick={ontimer}
	title={running ? 'Arrêter le chrono' : 'Démarrer le chrono'}
	aria-label={running ? 'Arrêter le chrono' : 'Démarrer le chrono'}
	class="group/timer relative flex h-7 shrink-0 items-center gap-1.5 rounded-md px-1.5 text-xs transition hover:bg-accent-soft hover:text-accent-text {running
		? 'text-accent-text'
		: 'text-ink-3 opacity-0 group-hover:opacity-100 max-sm:hidden'}"
>
	{#if running}
		<span class="size-2 animate-pulse rounded-full prism"></span>chrono
		<Pause size={12} class="hidden group-hover/timer:block" />
	{:else}<Play size={13} />{/if}
</button>
