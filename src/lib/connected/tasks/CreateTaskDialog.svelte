<script lang="ts">
	import { untrack } from 'svelte';
	import { CalendarClock, UserRound } from '@lucide/svelte';
	import type { TaskDraft } from '$lib/client/actions/tasks';
	import { useApp } from '$lib/client/context';
	import { dueLabel, firstName } from '$lib/client/format';
	import { tint } from '$lib/client/labels';
	import { now } from '$lib/client/now.svelte';
	import { toasts } from '$lib/client/toasts.svelte';
	import { activeProjects } from '$lib/client/views/workspace';
	import { parseQuickEntry } from '$lib/modules/tasks/domain/quick-entry';
	import type { Quadrant } from '$lib/modules/tasks/domain/task';
	import Button from '$lib/ui/atoms/Button.svelte';
	import TextArea from '$lib/ui/atoms/TextArea.svelte';
	import Dialog from '$lib/ui/molecules/Dialog.svelte';
	import DuePicker from '$lib/ui/molecules/DuePicker.svelte';
	import Field from '$lib/ui/molecules/Field.svelte';
	import PeoplePicker from '$lib/ui/molecules/PeoplePicker.svelte';
	import QuadrantPicker from '$lib/ui/molecules/QuadrantPicker.svelte';
	import { teamOrder } from '../team/usePresence.svelte';
	import { QUICK_HINT } from './quick-add';

	let { open = $bindable(), seed }: { open: boolean; seed: Partial<TaskDraft> } = $props();
	const { app, actions, overlays } = useApp();

	const projects = $derived(activeProjects(app.projects.all));
	const isIdea = $derived(seed.status === 'idea');

	let text = $state('');
	let projectId = $state('');
	let quadrant = $state<Quadrant | null>(null);
	let assigneeId = $state<string | null>(null);
	let dueDate = $state<string | null>(null);
	let notes = $state('');
	const people = $derived(teamOrder(app, projectId));

	$effect(() => {
		if (!open) return;
		untrack(() => {
			text = seed.title ?? '';
			notes = seed.notes ?? '';
			projectId = seed.projectId ?? projects[0]?.id ?? '';
			quadrant = seed.quadrant ?? null;
			assigneeId = seed.assigneeId ?? null;
			dueDate = seed.dueDate ?? null;
		});
	});

	const parsed = $derived(parseQuickEntry(text, app.users.all, now.today, app.meId));
	const parsedPerson = $derived(app.users.get(parsed.assigneeId));

	function submit(event: SubmitEvent) {
		event.preventDefault();
		if (!projectId) return toasts.error('Choisis d’abord un projet (ou crée-en un).');
		const task = actions.tasks.create({
			projectId,
			title: parsed.title,
			notes,
			status: seed.status ?? 'todo',
			quadrant: isIdea ? null : quadrant,
			assigneeId: parsed.assigneeId ?? assigneeId,
			dueDate: parsed.dueDate ?? dueDate
		});
		if (!task) return;
		open = false;
		toasts.show(isIdea ? 'Idée notée' : 'Tâche ajoutée', {
			tone: 'success',
			action: { label: 'Ouvrir', run: () => overlays.openTask(task.id) }
		});
	}
</script>

<Dialog
	bind:open
	size="lg"
	title={isIdea ? 'Noter une idée' : 'Nouvelle tâche'}
	description={isIdea
		? 'Elle reste de côté, dans l’onglet Idées du projet, jusqu’à ce que tu la passes « À faire ».'
		: undefined}
>
	<form id="task-form" class="flex flex-col gap-5" onsubmit={submit}>
		<div class="flex flex-col gap-2">
			<!-- svelte-ignore a11y_autofocus (a dialog focuses its autofocus field when it opens) -->
			<input
				bind:value={text}
				required
				autofocus
				aria-label="Titre"
				placeholder={isIdea ? 'L’idée en quelques mots' : 'Que faut-il faire ?'}
				class="h-12 w-full rounded-xl border border-line bg-surface px-4 text-lg font-medium outline-none placeholder:font-normal focus:border-accent focus:ring-3 focus:ring-accent-soft"
			/>
			{#if parsedPerson || parsed.dueDate}
				<p class="flex flex-wrap gap-2 text-sm">
					{#if parsedPerson}
						<span
							class="inline-flex items-center gap-1 rounded-md bg-accent-soft px-2 py-0.5 font-medium text-accent-text"
						>
							<UserRound size={13} />{parsedPerson.id === app.meId
								? 'Pour moi'
								: `Pour ${firstName(parsedPerson.name)}`}
						</span>
					{/if}
					{#if parsed.dueDate}
						<span
							class="inline-flex items-center gap-1 rounded-md bg-accent-soft px-2 py-0.5 font-medium text-accent-text"
						>
							<CalendarClock size={13} />{dueLabel(parsed.dueDate, now.today)}
						</span>
					{/if}
				</p>
			{:else if !isIdea}
				<p class="text-sm text-ink-3">{QUICK_HINT}</p>
			{/if}
		</div>

		{#if projects.length > 1 || !projectId}
			<Field label="Projet">
				<div class="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Projet">
					{#each projects as project (project.id)}
						<button
							type="button"
							role="radio"
							aria-checked={projectId === project.id}
							onclick={() => (projectId = project.id)}
							class={[
								'inline-flex h-8 items-center gap-2 rounded-full border px-3 text-sm font-medium transition-colors',
								projectId === project.id
									? 'border-accent bg-accent-soft text-accent-text'
									: 'border-line text-ink-2 hover:border-line-strong'
							]}
						>
							<span class="size-2.5 rounded-[3px]" style:background-color={tint(project.color)}
							></span>{project.name}
						</button>
					{:else}
						<p class="text-base text-ink-3">
							Crée d’abord un projet avec le « + » à côté de « Projets ».
						</p>
					{/each}
				</div>
			</Field>
		{/if}

		{#if !isIdea}
			<Field label="Priorité">
				<QuadrantPicker value={quadrant} onchange={(q) => (quadrant = q)} />
			</Field>
			{#if !parsed.assigneeId}
				<Field label="Qui s’en occupe">
					<PeoplePicker
						{people}
						meId={app.meId}
						value={assigneeId}
						onchange={(id) => (assigneeId = id)}
					/>
				</Field>
			{/if}
			{#if !parsed.dueDate}
				<Field label="Échéance">
					<DuePicker value={dueDate} today={now.today} onchange={(d) => (dueDate = d)} />
				</Field>
			{/if}
		{/if}
		<Field label="Notes (facultatif)">
			<TextArea bind:value={notes} placeholder="Détails, liens…" class="min-h-16" />
		</Field>
	</form>
	{#snippet footer()}
		<Button variant="ghost" onclick={() => (open = false)}>Annuler</Button>
		<Button type="submit" form="task-form" variant="primary" disabled={!parsed.title.trim()}>
			{isIdea ? 'Noter l’idée' : 'Créer la tâche'}
		</Button>
	{/snippet}
</Dialog>
