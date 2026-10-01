<script lang="ts">
	import { Check, Pause, Play, Trash2 } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import { isRunning } from '$lib/modules/time/domain/time-entry';
	import type { ElementSummary } from '$lib/modules/kernel/domain/element';
	import StatusIcon from '$lib/ui/atoms/StatusIcon.svelte';
	import FormField from '$lib/ui/molecules/form/FormField.svelte';
	import InlineRichText from '$lib/ui/molecules/InlineRichText.svelte';
	import InlineText from '$lib/ui/molecules/InlineText.svelte';
	import Backlinks from '../Backlinks.svelte';
	import ElementTalk from './ElementTalk.svelte';
	import TaskProperties from './TaskProperties.svelte';

	let { element, onclose }: { element: ElementSummary; onclose: () => void } = $props();
	const { store, actions, refs, me } = useProject();
	const task = $derived(store.tasks.get(element.id)!);
	const done = $derived(task?.status === 'done');
	const running = $derived(
		store.timeEntries.items.some(
			(e) => e.taskId === element.id && e.userId === me.id && isRunning(e)
		)
	);
	const tick = $derived(
		done
			? 'Rouvrir'
			: task?.status === 'review'
				? 'Valider'
				: task?.reviewerId && task.reviewerId !== me.id
					? 'Cocher · envoyer à valider'
					: 'Cocher : c’est fait'
	);
	const button =
		'inline-flex h-11 items-center gap-2 rounded-[11px] border-[1.5px] px-4 text-sm font-bold transition';
</script>

{#if task}
	<div class="flex items-start gap-3">
		<span class="mt-1.5"><StatusIcon status={task.status} size={24} /></span>
		<InlineText
			value={task.title}
			onsave={(title) => actions.tasks.update(task.id, { title })}
			class="text-2xl leading-tight font-extrabold tracking-[-0.01em] {done ? 'text-ink-3' : ''}"
		/>
	</div>
	<div class="mt-5 flex flex-wrap gap-2.5">
		<button
			type="button"
			onclick={() => (done ? actions.tasks.move(task.id, 'todo') : actions.tasks.finish(task.id))}
			class="{button} border-primary bg-primary text-primary-ink hover:opacity-90"
			><Check size={17} />{tick}</button
		>
		{#if !done}
			<button
				type="button"
				onclick={() => (running ? actions.tasks.stopTimer() : actions.tasks.start(task.id))}
				class="{button} {running
					? 'border-accent bg-accent-soft text-accent-text'
					: 'border-line-strong hover:border-ink-3'}"
			>
				{#if running}<Pause size={16} />Arrêter le chrono{:else}<Play size={16} />Démarrer le chrono{/if}
			</button>
		{/if}
	</div>
	<div class="mt-8"><TaskProperties {task} /></div>
	<div class="mt-6">
		<FormField label="Détails">
			<div class="rounded-[12px] border-[1.5px] border-line-strong px-3.5 py-2.5">
				<InlineRichText
					value={task.description}
					resolve={refs.resolve}
					suggest={refs.suggest}
					placeholder="Ce qu’il faut savoir pour s’y mettre…"
					onsave={(description) => actions.tasks.update(task.id, { description })}
				/>
			</div>
		</FormField>
	</div>
	<div class="mt-8 border-t-[1.5px] border-line pt-6">
		<ElementTalk element={task} featureId={task.featureId} concerned={task.assigneeIds} />
	</div>
	<Backlinks id={task.id} except="message" framed />
	<div class="mt-8 flex justify-end">
		<button
			type="button"
			onclick={() => (actions.tasks.remove(task.id), onclose())}
			class="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-ui font-semibold text-ink-3 hover:bg-hover hover:text-danger"
			><Trash2 size={15} />Supprimer</button
		>
	</div>
{/if}
