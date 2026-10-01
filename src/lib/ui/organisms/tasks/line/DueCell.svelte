<script lang="ts">
	import { Calendar } from '@lucide/svelte';
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
		tone === 'late' ? 'text-must' : tone === 'soon' ? 'text-should' : 'text-ink-2'
	);
</script>

<div class="relative w-[104px] shrink-0">
	<PickMenu title="Échéance" {options} {onpick} align="end">
		{#snippet trigger(toggle)}
			<button
				type="button"
				onclick={toggle}
				title="Changer l’échéance"
				class="flex h-7 w-full items-center gap-1.5 rounded-md px-2 text-xs transition hover:bg-sunken {dueDate
					? color
					: 'text-ink-3 opacity-0 group-hover:opacity-100 max-sm:opacity-100'}"
			>
				<Calendar size={13} />{dueDate ? relativeDueDate(dueDate) : 'Échéance'}
			</button>
		{/snippet}
	</PickMenu>
</div>
