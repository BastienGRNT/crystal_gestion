<script lang="ts">
	import type { Suggestion } from '../types';
	import RefTextArea from './RefTextArea.svelte';

	interface Props {
		label: string;
		value: string;
		suggest: (symbol: '#' | '@', query: string) => Suggestion[];
		placeholder?: string;
	}

	let { label, value = $bindable(), suggest, placeholder }: Props = $props();
</script>

<label
	class="block rounded-lg border border-line bg-surface-2 px-3 pt-2 pb-1 transition focus-within:border-accent focus-within:bg-surface"
>
	<span class="font-mono text-[10.5px] tracking-[0.12em] text-ink-3 uppercase">{label}</span>
	<RefTextArea
		bind:value
		{suggest}
		{placeholder}
		class="mt-0.5 min-h-12 text-[13.5px] leading-relaxed"
	/>
</label>
