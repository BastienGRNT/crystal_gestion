<script lang="ts">
	import { Inbox } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import { dnd, reflow } from '$lib/client/dnd.svelte';
	import { BOXES } from '$lib/client/labels';
	import { QUADRANTS, type Quadrant, type Task } from '$lib/modules/tasks/domain/task';
	import Avatar from '$lib/ui/atoms/Avatar.svelte';
	import DropSlot from '$lib/ui/atoms/DropSlot.svelte';

	interface Props {
		tasks: Task[];
		ondrop: (taskId: string, index: number) => void;
		onsort: (task: Task, quadrant: Quadrant) => void;
	}

	let { tasks, ondrop, onsort }: Props = $props();
	const { app, overlays } = useApp();
	const rows = $derived(dnd.rows('inbox', tasks));
</script>

<section
	data-drop-area
	aria-labelledby="inbox-title"
	class="rounded-2xl border border-dashed border-line-strong bg-surface p-3"
>
	<header class="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 px-1 pb-2.5">
		<Inbox size={16} class="translate-y-0.5 text-ink-3" aria-hidden="true" />
		<h2 id="inbox-title" class="text-md font-semibold">À trier</h2>
		<span class="text-sm font-medium text-ink-3">{tasks.length}</span>
		<p class="text-sm text-ink-3">
			Range chaque tâche d’un clic sur sa case, ou glisse-la dans la matrice.
		</p>
	</header>
	<div {@attach dnd.dropzone('inbox', ondrop)} class="relative flex flex-col gap-1.5">
		{#each rows as row (row.key)}
			<div animate:reflow {@attach row.item && dnd.draggable(row.item.id, 'inbox')}>
				{#if !row.item}
					<DropSlot height={dnd.active?.height ?? 0} />
				{:else}
					{@const task = row.item}
					{@const assignee = app.users.get(task.assigneeId)}
					<div
						class="flex min-h-11 touch-manipulation items-center gap-2 rounded-lg bg-surface-2 py-1.5 pr-1.5 pl-3 select-none"
					>
						<button
							data-drag-handle
							class="min-w-0 flex-1 cursor-grab truncate text-left text-base hover:underline"
							onclick={() => overlays.openTask(task.id)}
						>
							{task.title}
						</button>
						{#if assignee}<Avatar name={assignee.name} color={assignee.color} size="xs" />{/if}
						<div class="flex gap-1" role="group" aria-label="Ranger « {task.title} »">
							{#each QUADRANTS as quadrant (quadrant)}
								{@const box = BOXES[quadrant]}
								<button
									title={`${box.label} (${box.axes})`}
									aria-label={`Ranger dans ${box.label}`}
									onclick={() => onsort(task, quadrant)}
									class={[
										'flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors',
										box.soft,
										box.text,
										'hover:brightness-95 dark:hover:brightness-125'
									]}
								>
									<span class={['size-2 rounded-full', box.dot]}></span><span
										class="hidden xl:inline">{box.label}</span
									>
								</button>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		{/each}
	</div>
</section>
