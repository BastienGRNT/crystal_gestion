<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Icon } from '../types';

	interface Props {
		icon?: Icon;
		title: string;
		/** What to do next, in one sentence. */
		text?: string;
		compact?: boolean;
		children?: Snippet;
	}

	let { icon: IconComponent, title, text, compact = false, children }: Props = $props();
</script>

<div
	class={[
		'flex flex-col items-center text-center',
		compact
			? 'gap-1.5 px-4 py-6'
			: 'gap-3 rounded-2xl border border-dashed border-line-strong px-6 py-14'
	]}
>
	{#if IconComponent && !compact}
		<span class="flex size-11 items-center justify-center rounded-xl bg-surface-2 text-ink-3">
			<IconComponent size={22} aria-hidden="true" />
		</span>
	{/if}
	<p class={compact ? 'text-sm font-medium text-ink-2' : 'text-md font-semibold'}>{title}</p>
	{#if text}<p class={['max-w-sm text-ink-3', compact ? 'text-sm' : 'text-base']}>{text}</p>{/if}
	{#if children}<div class="mt-1 flex flex-wrap justify-center gap-2">
			{@render children()}
		</div>{/if}
</div>
