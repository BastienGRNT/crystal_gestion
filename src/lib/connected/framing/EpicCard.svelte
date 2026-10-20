<script lang="ts">
	import AskPm from '../assistant/AskPm.svelte';
	import { CalendarClock, MoreHorizontal, RotateCcw, Trash2 } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import { epicProgress } from '$lib/client/views/framing';
	import type { Epic } from '$lib/modules/framing/domain/framing';
	import { activeComponents } from '$lib/modules/tasks/domain/component';
	import IconButton from '$lib/ui/atoms/IconButton.svelte';
	import Select from '$lib/ui/atoms/Select.svelte';
	import EditableText from '$lib/ui/molecules/EditableText.svelte';
	import InlineAdd from '$lib/ui/molecules/InlineAdd.svelte';
	import Menu from '$lib/ui/molecules/Menu.svelte';
	import StoryRow from './StoryRow.svelte';

	let { epic }: { epic: Epic } = $props();
	const { app, actions } = useApp();

	const stories = $derived(
		app.stories.all.filter((s) => s.epicId === epic.id).sort((a, b) => a.position - b.position)
	);
	const progress = $derived(epicProgress(epic, app.stories.all, app.tasks.all));
	const modules = $derived(
		activeComponents(app.components.all.filter((c) => c.projectId === epic.projectId))
	);
	const initiatives = $derived(app.initiatives.all.filter((i) => i.projectId === epic.projectId));
	let asking = $state(false);
	let why = $state('');

	function postpone() {
		actions.framing.postponeEpic(epic.id, why.trim());
		asking = false;
		why = '';
	}
</script>

<article
	class={[
		'flex flex-col gap-2 rounded-2xl border border-line bg-surface px-4 py-3 shadow-card',
		epic.later && 'opacity-75'
	]}
>
	<div class="flex items-start gap-2">
		<div class="flex min-w-0 flex-1 flex-col">
			<EditableText
				label="Epic"
				value={epic.title}
				maxlength={120}
				class="text-md font-semibold"
				onsave={(title) => actions.framing.updateEpic(epic.id, { title })}
			/>
			<EditableText
				label="Description"
				value={epic.description}
				placeholder="Le grand ensemble de fonctionnalités, en une phrase"
				allowEmpty
				maxlength={4000}
				class="text-sm text-ink-2"
				onsave={(description) => actions.framing.updateEpic(epic.id, { description })}
			/>
		</div>
		<span class="shrink-0 pt-2.5 text-sm text-ink-3 tabular-nums"
			>{progress.delivered}/{progress.total} livrée{progress.delivered > 1 ? 's' : ''}</span
		>
		<Menu
			label="Plus d’actions"
			items={[
				epic.later
					? {
							label: 'Remettre dans le périmètre',
							icon: RotateCcw,
							run: () => actions.framing.updateEpic(epic.id, { later: false })
						}
					: { label: 'Passer à plus tard…', icon: CalendarClock, run: () => (asking = true) },
				'separator',
				{
					label: 'Supprimer l’epic',
					icon: Trash2,
					danger: true,
					run: () => actions.framing.removeEpic(epic)
				}
			]}
		>
			{#snippet trigger({ props })}<IconButton
					icon={MoreHorizontal}
					size="sm"
					label="Plus d’actions"
					{...props}
				/>{/snippet}
		</Menu>
	</div>

	{#if asking}
		<form
			class="flex flex-wrap items-center gap-2 rounded-xl bg-warn-soft p-3 text-sm"
			onsubmit={(e) => {
				e.preventDefault();
				postpone();
			}}
		>
			<span class="text-warn-text"
				>Ses tâches en cours retournent aux idées, et une décision est notée. Pourquoi ?</span
			>
			<!-- svelte-ignore a11y_autofocus -->
			<input
				bind:value={why}
				autofocus
				maxlength={500}
				aria-label="Pourquoi la passer à plus tard"
				placeholder="Ex. : pas avant la bêta"
				class="h-10 min-w-0 flex-1 rounded-lg border border-line-strong bg-surface px-3"
			/>
			<button type="submit" class="h-10 rounded-lg bg-ink px-3 font-medium text-bg"
				>Confirmer</button
			>
			<button type="button" class="h-10 px-2 text-ink-3" onclick={() => (asking = false)}
				>Annuler</button
			>
		</form>
	{/if}

	<div class="flex flex-wrap gap-2">
		{#if modules.length}
			<Select
				size="sm"
				label="Module"
				value={epic.componentId ?? ''}
				options={[
					{ value: '', label: 'Aucun module' },
					...modules.map((m) => ({ value: m.id, label: `Module : ${m.name}` }))
				]}
				onchange={(componentId) =>
					actions.framing.updateEpic(epic.id, { componentId: componentId || null })}
			/>
		{/if}
		{#if initiatives.length}
			<Select
				size="sm"
				label="Initiative"
				value={epic.initiativeId ?? ''}
				options={[
					{ value: '', label: 'Aucune initiative' },
					...initiatives.map((i) => ({ value: i.id, label: `Initiative : ${i.title}` }))
				]}
				onchange={(initiativeId) =>
					actions.framing.updateEpic(epic.id, { initiativeId: initiativeId || null })}
			/>
		{/if}
	</div>

	{#if stories.length}
		<ul class="flex flex-col">
			{#each stories as story (story.id)}<StoryRow {story} />{/each}
		</ul>
	{/if}
	{#if !epic.later}
		<div class="self-start">
			<AskPm projectId={epic.projectId} action="writeStories" targetId={epic.id} variant="ghost" />
		</div>
		<InlineAdd
			label="Ajouter une story"
			placeholder="Ce que la personne veut faire, ex. : réserver sans créer de compte"
			onadd={(want) => actions.framing.addStory(epic.projectId, want, { epicId: epic.id }) !== null}
		/>
	{/if}
</article>
