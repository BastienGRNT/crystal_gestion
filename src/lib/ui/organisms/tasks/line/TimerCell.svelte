<script lang="ts">
	import { Pause, Play } from '@lucide/svelte';

	let { running, ontimer }: { running: boolean; ontimer: () => void } = $props();
</script>

<button
	type="button"
	onclick={ontimer}
	title={running ? 'Arrêter le chrono' : 'Démarrer le chrono'}
	aria-label={running ? 'Arrêter le chrono' : 'Démarrer le chrono'}
	class="relative flex h-7 shrink-0 items-center gap-1 rounded-md px-1.5 text-xs transition hover:bg-accent-soft hover:text-accent-text {running
		? 'bg-accent-soft text-accent-text'
		: 'text-ink-3 opacity-0 group-hover:opacity-100 max-sm:hidden'}"
>
	{#if running}<Pause size={13} />En cours{:else}<Play size={13} />{/if}
</button>
