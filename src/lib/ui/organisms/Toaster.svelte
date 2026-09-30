<script lang="ts">
	import { toasts } from '$lib/client/toasts.svelte';
	import { CircleAlert, CircleCheck, Info } from '@lucide/svelte';

	const icons = { info: Info, error: CircleAlert, success: CircleCheck };
	const tones = { info: 'text-accent', error: 'text-danger', success: 'text-success' };
</script>

<div
	class="pointer-events-none fixed top-4 right-4 z-50 flex flex-col gap-2 max-md:inset-x-4 max-md:top-auto max-md:bottom-[calc(8.5rem+env(safe-area-inset-bottom))]"
	aria-live="polite"
>
	{#each toasts.items as toast (toast.id)}
		{@const Icon = icons[toast.tone]}
		<div
			class="pointer-events-auto flex max-w-sm animate-rise items-center gap-3 rounded-xl border border-line bg-surface py-2 pr-2 pl-3.5 shadow-pop md:min-w-72"
			role="status"
		>
			<Icon size={17} class="shrink-0 {tones[toast.tone]}" />
			<span class="min-w-0 flex-1">{toast.message}</span>
			{#if toast.action}
				<button
					class="h-8 rounded-lg px-3 font-semibold text-accent-text transition hover:bg-accent-soft"
					onclick={() => toasts.act(toast)}>{toast.action.label}</button
				>
			{/if}
			<button
				class="h-8 rounded-lg px-2 text-ink-3 transition hover:bg-sunken hover:text-ink"
				aria-label="Fermer"
				onclick={() => toasts.dismiss(toast.id)}>✕</button
			>
		</div>
	{/each}
</div>
