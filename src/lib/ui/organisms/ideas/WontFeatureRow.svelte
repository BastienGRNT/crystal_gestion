<script lang="ts">
	import { Undo2 } from '@lucide/svelte';
	import type { FeatureTagView } from '$lib/client/views/element-view';
	import Button from '../../atoms/Button.svelte';
	import PriorityDot from '../../atoms/PriorityDot.svelte';

	interface Props {
		feature: FeatureTagView & { description: string };
		onrestore: () => void;
	}

	let { feature, onrestore }: Props = $props();
</script>

<li class="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line py-3 last:border-b-0">
	<PriorityDot priority="wont" />
	<a href={feature.href} class="group min-w-0 flex-1">
		<span class="flex items-baseline gap-2">
			<span
				class="truncate text-[14.5px] font-medium group-hover:underline group-hover:decoration-line-strong group-hover:underline-offset-4"
				>{feature.title}</span
			>
			<span class="font-mono text-[11px] text-ink-3">{feature.ref}</span>
		</span>
		{#if feature.description}<span class="mt-0.5 block truncate text-[13px] text-ink-3"
				>{feature.description}</span
			>{/if}
	</a>
	<Button size="sm" onclick={onrestore}><Undo2 size={13} /> Remettre en Could</Button>
</li>
