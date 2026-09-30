<script lang="ts">
	import type { RefView } from '../types';
	import RichText from './RichText.svelte';

	interface Props {
		label: string;
		text: string;
		resolve: (ref: string) => RefView | undefined;
		personName?: (userId: string) => string | undefined;
		clamp?: boolean;
	}

	let { label, text, resolve, personName, clamp = true }: Props = $props();
</script>

<div class="min-w-0">
	<p class="font-mono text-[10.5px] tracking-[0.12em] text-ink-3 uppercase">{label}</p>
	<RichText
		{text}
		{resolve}
		{personName}
		class="mt-0.5 text-[13.5px] leading-relaxed text-ink-2 {clamp ? 'line-clamp-3' : ''}"
	/>
</div>
