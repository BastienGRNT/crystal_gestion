<script lang="ts">
	import { KINDS } from '$lib/client/labels';
	import { TASK_KINDS, type TaskKind } from '$lib/modules/tasks/domain/task';

	interface Props {
		value: TaskKind;
		onchange: (kind: TaskKind) => void;
	}

	let { value, onchange }: Props = $props();
</script>

<div class="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Type">
	{#each TASK_KINDS as kind (kind)}
		{@const meta = KINDS[kind]}
		<button
			type="button"
			role="radio"
			aria-checked={value === kind}
			title={meta.hint}
			onclick={() => onchange(kind)}
			class={[
				'inline-flex h-10 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors',
				value === kind
					? kind === 'bug'
						? 'border-danger/50 bg-danger-soft text-danger-text'
						: 'border-accent bg-accent-soft text-accent-text'
					: 'border-line text-ink-2 hover:border-line-strong hover:bg-surface-2'
			]}
		>
			<meta.icon size={15} aria-hidden="true" />{meta.label}
		</button>
	{/each}
</div>
