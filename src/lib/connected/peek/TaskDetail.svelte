<script lang="ts">
	import { Play, Trash2 } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import { isRunning } from '$lib/modules/time/domain/time-entry';
	import type { ElementSummary } from '$lib/modules/kernel/domain/element';
	import Button from '$lib/ui/atoms/Button.svelte';
	import Checkbox from '$lib/ui/atoms/Checkbox.svelte';
	import InlineRichText from '$lib/ui/molecules/InlineRichText.svelte';
	import InlineText from '$lib/ui/molecules/InlineText.svelte';
	import Backlinks from '../Backlinks.svelte';
	import TaskProperties from './TaskProperties.svelte';

	let { element, onclose }: { element: ElementSummary; onclose: () => void } = $props();
	const { store, actions, refs, me } = useProject();
	const task = $derived(store.tasks.get(element.id)!);
	const running = $derived(
		store.timeEntries.items.some(
			(e) => e.taskId === element.id && e.userId === me.id && isRunning(e)
		)
	);
	const done = $derived(task?.status === 'done');
</script>

{#if task}
	<div class="flex items-start gap-3">
		<span class="mt-2.5"
			><Checkbox
				checked={done}
				label="Terminer"
				onchange={(checked) =>
					checked ? actions.tasks.finish(task.id) : actions.tasks.move(task.id, 'todo')}
			/></span
		>
		<InlineText
			value={task.title}
			onsave={(title) => actions.tasks.update(task.id, { title })}
			class="font-display text-[30px] leading-tight {done ? 'text-ink-3 line-through' : ''}"
		/>
	</div>
	<div class="mt-4 flex gap-2">
		{#if !done && !running}<Button
				variant="primary"
				size="sm"
				onclick={() => actions.tasks.start(task.id)}><Play size={13} /> Lancer</Button
			>{/if}
		{#if running}<Button size="sm" onclick={() => actions.tasks.pause()}>Mettre en pause</Button
			>{/if}
		<Button
			variant="ghost"
			size="sm"
			class="ml-auto"
			onclick={() => (actions.tasks.remove(task.id), onclose())}
			><Trash2 size={13} /> Supprimer</Button
		>
	</div>
	<div class="mt-6"><TaskProperties {task} /></div>
	<div class="mt-6 border-t border-line pt-5">
		<h3 class="mb-2 text-[12px] font-medium tracking-wide text-ink-3 uppercase">Description</h3>
		<InlineRichText
			value={task.description}
			resolve={refs.resolve}
			suggest={refs.suggest}
			placeholder="Ajouter du contexte…"
			onsave={(description) => actions.tasks.update(task.id, { description })}
		/>
	</div>
	<div class="mt-6 border-t border-line pt-5"><Backlinks id={task.id} /></div>
{/if}
