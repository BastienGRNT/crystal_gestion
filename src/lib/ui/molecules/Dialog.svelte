<script lang="ts">
	import { X } from '@lucide/svelte';
	import type { Snippet } from 'svelte';
	import IconButton from '../atoms/IconButton.svelte';

	interface Props {
		open: boolean;
		title: string;
		description?: string;
		size?: 'sm' | 'md' | 'lg';
		onclose?: () => void;
		children: Snippet;
		footer?: Snippet;
	}

	let {
		open = $bindable(),
		title,
		description,
		size = 'md',
		onclose,
		children,
		footer
	}: Props = $props();

	let dialog = $state<HTMLDialogElement>();
	const widths = { sm: 'sm:w-[460px]', md: 'sm:w-[580px]', lg: 'sm:w-[760px]' };

	$effect(() => {
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		if (!open && dialog.open) dialog.close();
	});
</script>

<dialog
	bind:this={dialog}
	aria-label={title}
	onclose={() => {
		open = false;
		onclose?.();
	}}
	onclick={(event) => event.target === dialog && dialog?.close()}
	class={[
		'm-auto max-h-[min(88dvh,820px)] w-[calc(100vw-24px)] overflow-hidden rounded-2xl border border-line bg-surface p-0 shadow-pop open:flex open:animate-pop open:flex-col',
		widths[size]
	]}
>
	<header class="flex items-start gap-3 px-6 pt-6 pb-4">
		<div class="min-w-0 flex-1">
			<h2 class="text-xl font-semibold tracking-tight">{title}</h2>
			{#if description}<p class="mt-1 text-base text-ink-3">{description}</p>{/if}
		</div>
		<IconButton
			icon={X}
			label="Fermer"
			size="sm"
			onclick={() => dialog?.close()}
			class="-mt-1 -mr-1"
		/>
	</header>
	<div class="min-h-0 flex-1 scrollbar-thin overflow-y-auto px-6 pb-6">{@render children()}</div>
	{#if footer}
		<footer class="flex items-center justify-end gap-2 border-t border-line bg-surface-2 px-6 py-4">
			{@render footer()}
		</footer>
	{/if}
</dialog>
