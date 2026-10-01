<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { TaskCardView } from '$lib/client/views/task-card';
	import Dot from '../../atoms/Dot.svelte';
	import type { TaskGroup } from '../../types';

	interface Props {
		groups: TaskGroup[];
		row: Snippet<[TaskCardView]>;
		/** Lighter separators, for a list inside a card. */
		inset?: boolean;
	}

	let { groups, row, inset = false }: Props = $props();
</script>

{#each groups as group (group.key)}
	<div
		class="flex items-center gap-2 px-2.5 {inset
			? 'pt-3 pb-1'
			: 'mb-0.5 border-b border-line pt-[18px] pb-1.5'}"
	>
		<Dot color={group.color} size={8} />
		<span class="text-ui font-semibold">{group.label}</span>
		{#if group.hint}<span class="text-xs text-ink-3">{group.hint}</span>{/if}
		<span class="ml-auto text-xs text-ink-3 tabular-nums">{group.tasks.length}</span>
	</div>
	{#each group.tasks as task (task.id)}{@render row(task)}{/each}
{/each}
