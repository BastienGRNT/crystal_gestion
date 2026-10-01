<script lang="ts">
	import { STATUS_LABELS, TASK_STATUSES, type TaskStatus } from '$lib/modules/tasks/domain/task';
	import StatusIcon from '../../atoms/StatusIcon.svelte';

	let { value, onchange }: { value: TaskStatus; onchange: (status: TaskStatus) => void } = $props();
</script>

<div role="radiogroup" aria-label="Statut" class="flex flex-wrap gap-2">
	{#each TASK_STATUSES as status (status)}
		{@const on = status === value}
		<button
			type="button"
			role="radio"
			aria-checked={on}
			onclick={() => onchange(status)}
			class="inline-flex h-10 items-center gap-2 rounded-[10px] border-[1.5px] px-3 text-sm font-semibold transition {on
				? 'border-ink bg-surface-2'
				: 'border-line-strong text-ink-2 hover:border-ink-3'}"
		>
			<StatusIcon {status} size={17} />{STATUS_LABELS[status]}
		</button>
	{/each}
</div>
