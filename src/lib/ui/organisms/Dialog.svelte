<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		label: string;
		children: Snippet;
		onclose: () => void;
	}

	let { label, children, onclose }: Props = $props();
</script>

<svelte:window onkeydown={(event) => event.key === 'Escape' && onclose()} />

<div
	class="fixed inset-0 z-50 flex items-start justify-center bg-ink/25 px-4 pt-[16vh] backdrop-blur-[2px]"
	role="presentation"
	onclick={onclose}
>
	<div
		class="w-full max-w-lg animate-rise rounded-xl border border-line bg-surface p-5 shadow-pop"
		role="dialog"
		aria-label={label}
		tabindex="-1"
		onclick={(event) => event.stopPropagation()}
		onkeydown={() => {}}
	>
		{@render children()}
	</div>
</div>
