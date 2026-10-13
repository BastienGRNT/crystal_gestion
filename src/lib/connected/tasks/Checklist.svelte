<script lang="ts">
	import { Check, X } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import type { Task } from '$lib/modules/tasks/domain/task';

	let { task }: { task: Task } = $props();
	const { actions } = useApp();
	let text = $state('');
	const done = $derived(task.checklist.filter((s) => s.done).length);
</script>

<div class="flex flex-col gap-2">
	{#if task.checklist.length}
		<div class="flex items-center gap-3">
			<div class="h-1.5 flex-1 overflow-hidden rounded-full bg-sunken">
				<div
					class="h-full rounded-full bg-ok transition-[width]"
					style:width="{(done / task.checklist.length) * 100}%"
				></div>
			</div>
			<span class="text-sm font-medium text-ink-3 tabular-nums">{done}/{task.checklist.length}</span
			>
		</div>
		<ul class="flex flex-col">
			{#each task.checklist as step (step.id)}
				<li class="group flex min-h-11 items-center gap-3 rounded-lg px-1 hover:bg-hover">
					<button
						type="button"
						role="checkbox"
						aria-checked={step.done}
						aria-label={step.text}
						onclick={() => actions.tasks.toggleStep(task.id, step.id)}
						class={[
							'flex size-5 shrink-0 items-center justify-center rounded-md border-[1.5px]',
							step.done ? 'border-ok bg-ok text-white' : 'border-ink-4 hover:border-ok'
						]}
					>
						{#if step.done}<Check size={13} strokeWidth={3} />{/if}
					</button>
					<span class={['min-w-0 flex-1 text-base', step.done && 'text-ink-3 line-through']}
						>{step.text}</span
					>
					<button
						type="button"
						aria-label="Retirer l’étape"
						onclick={() => actions.tasks.removeStep(task.id, step.id)}
						class="rounded-md p-1.5 text-ink-3 opacity-0 group-hover:opacity-100 hover:bg-hover hover:text-ink focus:opacity-100"
						><X size={15} /></button
					>
				</li>
			{/each}
		</ul>
	{/if}
	<form
		onsubmit={(e) => {
			e.preventDefault();
			actions.tasks.addStep(task.id, text);
			text = '';
		}}
	>
		<input
			bind:value={text}
			aria-label="Nouvelle étape"
			placeholder="+ Ajouter une étape, puis Entrée"
			class="h-11 w-full rounded-xl border border-dashed border-line-strong bg-transparent px-3.5 text-base outline-none focus:border-solid focus:border-accent focus:bg-surface focus:ring-4 focus:ring-accent-soft"
		/>
	</form>
</div>
