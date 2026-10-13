<script lang="ts">
	import { STATUS_LABEL } from '$lib/client/labels';
	import { TASK_STATUSES, type TaskStatus } from '$lib/modules/tasks/domain/task';

	let { value, onchange }: { value: TaskStatus; onchange: (status: TaskStatus) => void } = $props();
	const current = $derived(TASK_STATUSES.indexOf(value));
</script>

<!-- The flow of the board, as steps: where the task is, and one click to move it. -->
<div class="grid grid-cols-5 gap-1 rounded-xl bg-sunken p-1" role="radiogroup" aria-label="Statut">
	{#each TASK_STATUSES as status, i (status)}
		<button
			type="button"
			role="radio"
			aria-checked={status === value}
			onclick={() => onchange(status)}
			class={[
				'flex h-11 items-center justify-center rounded-lg px-1 text-center text-xs leading-tight font-semibold transition-all sm:text-sm',
				status === value
					? status === 'done'
						? 'bg-ok text-white shadow-raise'
						: 'bg-surface text-ink shadow-raise'
					: i < current
						? 'text-ink-2 hover:bg-hover'
						: 'text-ink-3 hover:bg-hover hover:text-ink'
			]}
		>
			{STATUS_LABEL[status]}
		</button>
	{/each}
</div>
