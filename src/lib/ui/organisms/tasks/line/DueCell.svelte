<script lang="ts">
	import { relativeDueDate } from '$lib/client/format';
	import PickMenu from '../../../molecules/PickMenu.svelte';
	import type { PickOption } from '../../../types';

	interface Props {
		dueDate: string | null;
		tone: 'late' | 'soon' | null;
		options: PickOption<string | null>[];
		onpick: (dueDate: string | null) => void;
	}

	let { dueDate, tone, options, onpick }: Props = $props();
	const color = $derived(
		tone === 'late'
			? 'text-must font-bold'
			: tone === 'soon'
				? 'text-should font-semibold'
				: 'text-ink-3'
	);
</script>

<div class="relative w-[96px] shrink-0">
	<PickMenu title="Échéance" {options} {onpick} align="end">
		{#snippet trigger(toggle)}
			<button
				type="button"
				onclick={toggle}
				title="Changer l’échéance"
				class="flex h-8 w-full items-center justify-end rounded-lg px-2 text-ui whitespace-nowrap transition hover:bg-sunken {dueDate
					? color
					: 'text-ink-3 opacity-0 group-hover:opacity-100 max-sm:hidden'}"
			>
				{dueDate ? relativeDueDate(dueDate) : '+ échéance'}
			</button>
		{/snippet}
	</PickMenu>
</div>
