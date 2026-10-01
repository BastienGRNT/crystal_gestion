<script lang="ts">
	import type { Snippet } from 'svelte';
	import { X } from '@lucide/svelte';

	interface Props {
		title: string;
		/** Left of the title: the kind's glyph or a feat color. */
		lead?: Snippet;
		children: Snippet;
		/** Left of the buttons: what happens next. */
		note?: string;
		submitLabel: string;
		disabled?: boolean;
		onsubmit: () => void;
		onclose: () => void;
		width?: string;
	}

	let {
		title,
		lead,
		children,
		note,
		submitLabel,
		disabled = false,
		onsubmit,
		onclose,
		width = 'max-w-[640px]'
	}: Props = $props();
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && onclose()} />

<div
	class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-overlay px-4 py-[6vh]"
	role="presentation"
	onclick={onclose}
>
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<form
		class="w-full {width} animate-rise overflow-hidden rounded-[22px] bg-surface shadow-pop"
		aria-label={title}
		onclick={(e) => e.stopPropagation()}
		onkeydown={(e) => (e.metaKey || e.ctrlKey) && e.key === 'Enter' && onsubmit()}
		onsubmit={(e) => (e.preventDefault(), onsubmit())}
	>
		<header class="flex items-center gap-3 px-7 pt-6 pb-2">
			{@render lead?.()}
			<h2 class="text-[22px] font-extrabold tracking-[-0.01em]">{title}</h2>
			<button
				type="button"
				onclick={onclose}
				aria-label="Fermer (Échap)"
				class="ml-auto flex size-9 items-center justify-center rounded-lg text-ink-3 hover:bg-hover hover:text-ink"
				><X size={18} /></button
			>
		</header>
		<div class="flex flex-col gap-6 px-7 pt-3 pb-7">{@render children()}</div>
		<footer class="flex items-center gap-3 border-t-[1.5px] border-line bg-surface-2 px-7 py-4">
			{#if note}<p class="min-w-0 flex-1 text-xs text-ink-3">{note}</p>{:else}<span class="flex-1"
				></span>{/if}
			<button
				type="button"
				onclick={onclose}
				class="h-11 rounded-[11px] border-[1.5px] border-line-strong px-4 text-sm font-bold hover:border-ink-3"
				>Annuler</button
			>
			<button
				type="submit"
				{disabled}
				class="h-11 rounded-[11px] bg-primary px-5 text-sm font-bold text-primary-ink transition hover:opacity-90 disabled:opacity-35"
				>{submitLabel}</button
			>
		</footer>
	</form>
</div>
