<script lang="ts">
	import { toasts } from '$lib/client/toasts.svelte';
	import { CircleAlert, CircleCheck, Info } from '@lucide/svelte';

	const icons = { info: Info, error: CircleAlert, success: CircleCheck };
	const tones = { info: 'text-accent', error: 'text-danger', success: 'text-success' };
</script>

<div
	class="pointer-events-none fixed right-4 bottom-4 z-50 flex flex-col gap-2 max-sm:bottom-20"
	aria-live="polite"
>
	{#each toasts.items as toast (toast.id)}
		{@const Icon = icons[toast.tone]}
		<button
			class="pointer-events-auto flex max-w-sm animate-rise items-center gap-2.5 rounded-lg border border-line bg-surface px-3.5 py-2.5 text-left shadow-pop"
			onclick={() => toasts.dismiss(toast.id)}
		>
			<Icon size={16} class={tones[toast.tone]} />
			<span>{toast.message}</span>
		</button>
	{/each}
</div>
