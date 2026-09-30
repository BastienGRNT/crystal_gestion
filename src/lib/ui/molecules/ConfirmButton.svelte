<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		onconfirm: () => void;
		children: Snippet;
		confirmLabel?: string;
	}

	let { onconfirm, children, confirmLabel = 'Confirmer ?' }: Props = $props();
	let armed = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;

	/** Two clicks instead of a modal: fast for the intent, safe against slips. */
	function click() {
		if (armed) return (clearTimeout(timer), (armed = false), onconfirm());
		armed = true;
		timer = setTimeout(() => (armed = false), 3000);
	}
</script>

<button
	type="button"
	onclick={click}
	class="inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-sm transition {armed
		? 'bg-danger text-white'
		: 'text-ink-3 hover:bg-danger/10 hover:text-danger'}"
>
	{#if armed}{confirmLabel}{:else}{@render children()}{/if}
</button>
