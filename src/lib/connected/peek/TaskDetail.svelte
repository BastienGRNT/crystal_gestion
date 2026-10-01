<script lang="ts">
	import { Trash2 } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import type { ElementSummary } from '$lib/modules/kernel/domain/element';
	import Button from '$lib/ui/atoms/Button.svelte';
	import StatusIcon from '$lib/ui/atoms/StatusIcon.svelte';
	import InlineRichText from '$lib/ui/molecules/InlineRichText.svelte';
	import InlineText from '$lib/ui/molecules/InlineText.svelte';
	import Backlinks from '../Backlinks.svelte';
	import ElementTalk from './ElementTalk.svelte';
	import TaskProperties from './TaskProperties.svelte';

	let { element, onclose }: { element: ElementSummary; onclose: () => void } = $props();
	const { store, actions, refs } = useProject();
	const task = $derived(store.tasks.get(element.id)!);
	const done = $derived(task?.status === 'done');
</script>

{#if task}
	<div class="flex items-start gap-3">
		<button
			type="button"
			class="mt-1.5 rounded-full transition hover:scale-110"
			aria-label={done ? 'Rouvrir' : 'Marquer comme fait'}
			title={done ? 'Rouvrir' : 'Marquer comme fait'}
			onclick={() => (done ? actions.tasks.move(task.id, 'todo') : actions.tasks.finish(task.id))}
			><StatusIcon status={task.status} size={20} /></button
		>
		<InlineText
			value={task.title}
			onsave={(title) => actions.tasks.update(task.id, { title })}
			class="text-xl leading-snug font-semibold tracking-[-0.01em] {done ? 'text-ink-3' : ''}"
		/>
	</div>
	<div class="mt-4 -ml-1"><TaskProperties {task} /></div>
	<div class="mt-5">
		<InlineRichText
			value={task.description}
			resolve={refs.resolve}
			suggest={refs.suggest}
			placeholder="Ajouter une description…"
			onsave={(description) => actions.tasks.update(task.id, { description })}
		/>
	</div>
	<div class="mt-6 border-t border-line pt-5">
		<ElementTalk element={task} featureId={task.featureId} />
	</div>
	<div class="mt-6 border-t border-line pt-5"><Backlinks id={task.id} except="message" /></div>
	<div class="mt-6 flex justify-end">
		<Button variant="ghost" size="sm" onclick={() => (actions.tasks.remove(task.id), onclose())}
			><Trash2 size={13} /> Supprimer</Button
		>
	</div>
{/if}
