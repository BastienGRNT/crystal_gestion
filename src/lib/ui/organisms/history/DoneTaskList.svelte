<script lang="ts">
	import { CircleCheck } from '@lucide/svelte';
	import type { DoneTask } from './types';

	let { tasks, onopen }: { tasks: DoneTask[]; onopen: (ref: string) => void } = $props();
</script>

<section class="rounded-xl border border-line bg-surface p-4">
	<h3 class="mb-2 text-[12px] font-medium tracking-wide text-ink-3 uppercase">
		Terminé <span class="font-mono text-ink-2">{tasks.length}</span>
	</h3>
	{#each tasks as task (task.id)}
		<button
			type="button"
			class="-mx-2 flex w-[calc(100%+1rem)] items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-[13px] hover:bg-sunken"
			onclick={() => onopen(task.ref)}
		>
			<CircleCheck size={14} class="shrink-0 text-success" />
			<span class="shrink-0 font-mono text-[11.5px] text-ink-3">{task.ref}</span>
			<span class="min-w-0 flex-1 truncate">{task.title}</span>
			{#if task.feature}<span class="hidden truncate text-[12px] text-ink-3 sm:inline"
					>{task.feature}</span
				>{/if}
			<span class="shrink-0 font-mono text-[11px] text-ink-3">{task.when}</span>
		</button>
	{:else}
		<p class="text-[13px] text-ink-3">Aucune tâche terminée sur cette période.</p>
	{/each}
</section>
