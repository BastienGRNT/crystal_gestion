<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		label: string;
		children: Snippet;
		onclose: () => void;
		width?: string;
	}

	let { label, children, onclose, width = 'max-w-[600px]' }: Props = $props();
</script>

<svelte:window onkeydown={(event) => event.key === 'Escape' && onclose()} />

<div
	class="fixed inset-0 z-50 flex items-start justify-center bg-overlay px-4 pt-[12vh]"
	role="presentation"
	onclick={onclose}
>
	<div
		class="w-full {width} animate-rise overflow-hidden rounded-[14px] border border-line bg-panel shadow-pop"
		role="dialog"
		aria-label={label}
		tabindex="-1"
		onclick={(event) => event.stopPropagation()}
		onkeydown={() => {}}
	>
		{@render children()}
	</div>
</div>
