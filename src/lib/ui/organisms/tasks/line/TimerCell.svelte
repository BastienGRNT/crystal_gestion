<script lang="ts">
	import { Pause, Play } from '@lucide/svelte';

	let { running, ontimer }: { running: boolean; ontimer: () => void } = $props();
</script>

<button
	type="button"
	onclick={ontimer}
	title={running ? 'Arrêter le chrono' : 'Démarrer le chrono'}
	aria-label={running ? 'Arrêter le chrono' : 'Démarrer le chrono'}
	class="relative flex size-7 shrink-0 items-center justify-center rounded-md transition hover:bg-accent-soft hover:text-accent {running
		? 'bg-accent-soft text-accent'
		: 'text-ink-3'}"
>
	{#if running}<Pause size={13} />{:else}<Play size={13} />{/if}
</button>
