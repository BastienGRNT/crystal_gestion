<script lang="ts">
	import { CircleCheck } from '@lucide/svelte';
	import type { DoneTask } from './types';

	let { tasks, onopen }: { tasks: DoneTask[]; onopen: (ref: string) => void } = $props();
</script>

<section class="rounded-[18px] border-[1.5px] border-line bg-surface p-4">
	<h3 class="mb-2 text-xs font-medium tracking-wide text-ink-3 uppercase">
		Terminé <span class="font-mono text-ink-2">{tasks.length}</span>
	</h3>
	{#each tasks as task (task.id)}
		<button
			type="button"
			class="-mx-2 flex w-[calc(100%+1rem)] items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm hover:bg-sunken"
			onclick={() => onopen(task.ref)}
		>
			<CircleCheck size={14} class="shrink-0 text-success" />
			<span class="shrink-0 font-mono text-xs text-ink-3">{task.ref}</span>
			<span class="min-w-0 flex-1 truncate">{task.title}</span>
			{#if task.feature}<span class="hidden truncate text-xs text-ink-3 sm:inline"
					>{task.feature}</span
				>{/if}
			<span class="shrink-0 font-mono text-2xs text-ink-3">{task.when}</span>
		</button>
	{:else}
		<p class="text-sm text-ink-3">Aucune Task terminée sur cette période.</p>
	{/each}
</section>
