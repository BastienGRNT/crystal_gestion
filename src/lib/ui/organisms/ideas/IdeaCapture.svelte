<script lang="ts">
	import { Lightbulb } from '@lucide/svelte';
	import Kbd from '../../atoms/Kbd.svelte';

	let { oncapture }: { oncapture: (title: string) => void } = $props();
	let value = $state('');

	// Clearing without blurring keeps the field ready for the next idea.
	function capture() {
		if (!value.trim()) return;
		oncapture(value.trim());
		value = '';
	}
</script>

<label
	class="flex h-[52px] items-center gap-3 rounded-xl border border-line-strong bg-surface px-4 shadow-card transition focus-within:border-accent"
>
	<Lightbulb size={18} class="shrink-0 text-should" />
	<!-- svelte-ignore a11y_autofocus -->
	<input
		bind:value
		autofocus
		aria-label="Nouvelle idée"
		placeholder="Une idée ? Écris-la et appuie sur Entrée"
		onkeydown={(event) => event.key === 'Enter' && capture()}
		class="min-w-0 flex-1 bg-transparent text-lg outline-none placeholder:text-ink-3"
	/>
	<span class="hidden sm:inline-flex"><Kbd>↵</Kbd></span>
</label>
