<script lang="ts">
	import { STATUS_LABELS, type TaskStatus } from '$lib/modules/tasks/domain/task';
	import Dot from '../../../atoms/Dot.svelte';
	import PickMenu from '../../../molecules/PickMenu.svelte';
	import { soft, STATUS_COLORS } from '../../../tones';
	import type { PickOption } from '../../../types';

	interface Props {
		status: TaskStatus;
		options: PickOption<TaskStatus>[];
		onpick: (status: TaskStatus) => void;
	}

	let { status, options, onpick }: Props = $props();
</script>

<div class="relative hidden w-24 shrink-0 md:block">
	<PickMenu title="Statut" {options} {onpick}>
		{#snippet trigger(toggle)}
			<button
				type="button"
				onclick={toggle}
				title="Changer le statut"
				class="inline-flex h-6 items-center gap-1.5 rounded-full px-2 text-xs font-medium whitespace-nowrap"
				style="background:{soft(STATUS_COLORS[status], 16)}"
			>
				<Dot color={STATUS_COLORS[status]} />{STATUS_LABELS[status]}
			</button>
		{/snippet}
	</PickMenu>
</div>
