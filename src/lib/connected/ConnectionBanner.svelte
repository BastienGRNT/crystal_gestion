<script lang="ts">
	import { WifiOff } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';

	const { realtime } = useProject();
</script>

{#if realtime.status === 'offline'}
	<div
		class="fixed top-3 left-1/2 z-50 flex -translate-x-1/2 animate-rise items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm text-ink-2 shadow-pop"
		role="status"
	>
		<WifiOff size={13} class="text-warning" /> Connexion perdue, reconnexion…
	</div>
{/if}
