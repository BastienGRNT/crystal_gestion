<script lang="ts">
	import { toasts } from '$lib/client/toasts.svelte';
	import { CircleAlert } from '@lucide/svelte';
</script>

<!-- Inverted pills at the bottom: visible without covering the page header or the peek. -->
<div
	class="pointer-events-none fixed bottom-5 left-1/2 z-[60] flex -translate-x-1/2 flex-col items-center gap-2 max-md:bottom-[calc(4.5rem+env(safe-area-inset-bottom))]"
	aria-live="polite"
>
	{#each toasts.items as toast (toast.id)}
		<div
			class="pointer-events-auto flex min-h-[42px] max-w-[calc(100vw-32px)] animate-rise items-center gap-3.5 rounded-[10px] bg-ink py-1.5 pr-2 pl-4 text-sm text-panel shadow-pop"
			role="status"
		>
			{#if toast.tone === 'error'}<CircleAlert size={16} class="shrink-0 text-must" />{/if}
			<span class="min-w-0">{toast.message}</span>
			{#if toast.action}
				<button
					class="h-7 shrink-0 rounded-[7px] bg-[rgb(127_127_127/0.25)] px-2.5 font-semibold"
					onclick={() => toasts.act(toast)}>{toast.action.label}</button
				>
			{/if}
		</div>
	{/each}
</div>
