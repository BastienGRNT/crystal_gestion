<script lang="ts">
	import { CircleAlert, CircleCheck, X } from '@lucide/svelte';
	import { fly } from 'svelte/transition';
	import type { Toast } from '$lib/client/toasts.svelte';

	let { toasts, ondismiss }: { toasts: Toast[]; ondismiss: (id: number) => void } = $props();
</script>

<div
	class="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
	aria-live="polite"
>
	{#each toasts as toast (toast.id)}
		<div
			transition:fly={{ y: 16, duration: 180 }}
			class="pointer-events-auto flex max-w-[min(92vw,460px)] items-center gap-3 rounded-xl bg-primary py-2.5 pr-2 pl-3.5 text-base text-primary-ink shadow-pop"
			role={toast.tone === 'error' ? 'alert' : 'status'}
		>
			{#if toast.tone === 'error'}
				<CircleAlert size={17} class="shrink-0 text-danger" aria-hidden="true" />
			{:else if toast.tone === 'success'}
				<CircleCheck size={17} class="shrink-0 text-ok" aria-hidden="true" />
			{/if}
			<span class="min-w-0 flex-1">{toast.message}</span>
			{#if toast.action}
				<button
					class="rounded-md px-2 py-1 text-base font-semibold underline decoration-current/40 underline-offset-4 hover:bg-white/10 hover:decoration-current dark:hover:bg-black/5"
					onclick={() => {
						toast.action?.run();
						ondismiss(toast.id);
					}}>{toast.action.label}</button
				>
			{/if}
			<button
				class="rounded-md p-1 opacity-60 hover:bg-white/10 hover:opacity-100"
				aria-label="Fermer"
				onclick={() => ondismiss(toast.id)}><X size={15} /></button
			>
		</div>
	{/each}
</div>
