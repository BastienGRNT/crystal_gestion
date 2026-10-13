<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		open: boolean;
		label: string;
		onclose: () => void;
		children: Snippet;
	}

	let { open, label, onclose, children }: Props = $props();
	let dialog = $state<HTMLDialogElement>();

	$effect(() => {
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		if (!open && dialog.open) dialog.close();
	});
</script>

<!-- A side panel: the page stays visible behind, a click outside or Échap closes it. -->
<dialog
	bind:this={dialog}
	aria-label={label}
	{onclose}
	onclick={(event) => event.target === dialog && dialog?.close()}
	class="drawer my-0 mr-0 ml-auto h-dvh max-h-dvh w-full max-w-full border-l border-line bg-surface p-0 shadow-pop sm:w-[540px]"
>
	{#if open}{@render children()}{/if}
</dialog>

<style>
	.drawer::backdrop {
		background: var(--overlay);
		opacity: 0.55;
	}
	.drawer[open] {
		animation: slide-in 180ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}
	@keyframes slide-in {
		from {
			transform: translateX(24px);
			opacity: 0;
		}
	}
</style>
