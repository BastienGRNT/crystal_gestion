<script lang="ts">
	import TaskRow from '../../molecules/TaskRow.svelte';
	import type { TodoGroup } from '../../types';

	interface Props {
		groups: TodoGroup[];
		ontoggle: (id: string, done: boolean) => void;
		onopen: (ref: string) => void;
		onstart: (id: string) => void;
	}

	let { groups, ontoggle, onopen, onstart }: Props = $props();
</script>

<div class="flex flex-col gap-7">
	{#each groups.filter((group) => group.tasks.length) as group (group.key)}
		<section>
			<header class="mb-1.5 flex items-baseline gap-2.5 px-2">
				<span class="size-2 self-center rounded-full {group.tone}"></span>
				<h2 class="text-[13px] font-semibold">{group.label}</h2>
				<span class="text-[12px] text-ink-3">{group.hint}</span>
				<span class="ml-auto font-mono text-[11px] text-ink-3">{group.tasks.length}</span>
			</header>
			<div class="flex flex-col">
				{#each group.tasks as task (task.id)}
					<div class="animate-rise">
						<TaskRow {task} ontoggle={(done) => ontoggle(task.id, done)} onopen={() => onopen(task.ref)} onstart={() => onstart(task.id)} />
					</div>
				{/each}
			</div>
		</section>
	{/each}
</div>
