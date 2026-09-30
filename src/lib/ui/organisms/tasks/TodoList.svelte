<script lang="ts">
	import TaskRow from '../../molecules/TaskRow.svelte';
	import type { TodoGroup } from '../../types';

	interface Props {
		groups: TodoGroup[];
		ontoggle: (id: string, done: boolean) => void;
		onopen: (ref: string) => void;
		onstart: (id: string) => void;
		empty?: string;
	}

	let { groups, ontoggle, onopen, onstart, empty }: Props = $props();
</script>

<div class="flex flex-col gap-7">
	{#if empty && !groups.some((group) => group.tasks.length)}
		<p class="rounded-lg bg-sunken px-4 py-3 text-ink-2">{empty}</p>
	{/if}
	{#each groups.filter((group) => group.tasks.length) as group (group.key)}
		<section>
			<header class="mb-1 flex items-baseline gap-2.5 px-3">
				<span class="size-2 self-center rounded-full {group.tone}"></span>
				<h2 class="text-sm font-semibold">{group.label}</h2>
				<span class="text-xs text-ink-3 max-sm:hidden">{group.hint}</span>
				<span class="ml-auto font-mono text-2xs text-ink-3">{group.tasks.length}</span>
			</header>
			<div class="flex flex-col">
				{#each group.tasks as task (task.id)}
					<div class="animate-rise">
						<TaskRow
							{task}
							ontoggle={(done) => ontoggle(task.id, done)}
							onopen={() => onopen(task.ref)}
							onstart={() => onstart(task.id)}
						/>
					</div>
				{/each}
			</div>
		</section>
	{/each}
</div>
