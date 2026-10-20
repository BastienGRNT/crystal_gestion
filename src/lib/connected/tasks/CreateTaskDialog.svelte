<script lang="ts">
	import { untrack } from 'svelte';
	import { CalendarClock, Layers, Puzzle, UserRound } from '@lucide/svelte';
	import type { TaskDraft } from '$lib/client/actions/tasks';
	import { useApp } from '$lib/client/context';
	import { dueLabel, firstName } from '$lib/client/format';
	import { KINDS, tint } from '$lib/client/labels';
	import { now } from '$lib/client/now.svelte';
	import { toasts } from '$lib/client/toasts.svelte';
	import { activeProjects } from '$lib/client/views/workspace';
	import { parseQuickEntry } from '$lib/modules/tasks/domain/quick-entry';
	import type { Quadrant, TaskKind } from '$lib/modules/tasks/domain/task';
	import Button from '$lib/ui/atoms/Button.svelte';
	import TextArea from '$lib/ui/atoms/TextArea.svelte';
	import Dialog from '$lib/ui/molecules/Dialog.svelte';
	import ComponentPicker from '$lib/ui/molecules/ComponentPicker.svelte';
	import DuePicker from '$lib/ui/molecules/DuePicker.svelte';
	import KindPicker from '$lib/ui/molecules/KindPicker.svelte';
	import Field from '$lib/ui/molecules/Field.svelte';
	import PeoplePicker from '$lib/ui/molecules/PeoplePicker.svelte';
	import QuadrantPicker from '$lib/ui/molecules/QuadrantPicker.svelte';
	import StepPicker from '$lib/ui/molecules/StepPicker.svelte';
	import { stepOptions } from '../roadmap/step-options';
	import { teamOrder } from '../team/usePresence.svelte';
	import { framingTargets } from '../framing/attach';
	import { componentOptions, reporters } from './components-of';
	import { QUICK_HINT } from './quick-add';
	import { stepFilter } from './step-filter.svelte';

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
	let milestoneId = $state<string | null>(null);
	// `null` until chosen: the words typed decide (a prefix, or a guess from the first words).
	let kindChosen = $state<TaskKind | null>(null);
	let critical = $state(false);
	let reportedBy = $state('');
	let componentId = $state<string | null>(null);
	const people = $derived(teamOrder(app, projectId));
	const steps = $derived(stepOptions(app, projectId));
	const modules = $derived(componentOptions(app, projectId));

	$effect(() => {
		if (!open) return;
		untrack(() => {
			text = seed.title ?? '';
			notes = seed.notes ?? '';
			projectId = seed.projectId ?? projects[0]?.id ?? '';
			quadrant = seed.quadrant ?? null;
			assigneeId = seed.assigneeId ?? null;
			dueDate = seed.dueDate ?? null;
			kindChosen = seed.kind ?? null;
			critical = seed.critical ?? false;
			reportedBy = seed.reportedBy ?? '';
			componentId = seed.componentId ?? null;
			// A bug is flow, not a deliverable: it goes to no step unless asked.
			milestoneId =
				seed.milestoneId !== undefined
					? seed.milestoneId
					: seed.kind === 'bug'
						? null
						: stepFilter.view(app, projectId).stepFor(seed.status ?? 'todo');
		});
	});

	const parsed = $derived(
		parseQuickEntry(
			text,
			app.users.all,
			now.today,
			app.meId,
			modules,
			reporters(app, projectId),
			framingTargets(app, projectId)
		)
	);
	const parsedFraming = $derived(
		app.stories.get(parsed.storyId)
			? `US-${app.stories.get(parsed.storyId)!.number}`
			: app.epics.get(parsed.epicId)?.title
	);
	const parsedPerson = $derived(app.users.get(parsed.assigneeId));
	const kind = $derived(parsed.kindSaid ? parsed.kind : (kindChosen ?? parsed.kind));
	const isBug = $derived(kind === 'bug');
	const isCritical = $derived(isBug && (critical || parsed.critical));
	const parsedModule = $derived(modules.find((m) => m.id === parsed.componentId));

	function submit(event: SubmitEvent) {
		event.preventDefault();
		if (!projectId) return toasts.error('Choisis d’abord un projet (ou crée-en un).');
		const task = actions.tasks.create({
			projectId,
			title: parsed.title,
			notes,
			status: seed.status ?? 'todo',
			kind,
			critical: isCritical,
			reportedBy: isBug ? parsed.reportedBy || reportedBy.trim() || null : null,
			componentId: parsed.componentId ?? componentId,
			storyId: parsed.storyId ?? seed.storyId ?? null,
			epicId: parsed.epicId ?? seed.epicId ?? null,
			quadrant: isIdea ? null : quadrant,
			assigneeId: parsed.assigneeId ?? assigneeId,
			dueDate: parsed.dueDate ?? dueDate,
			// A bug is flow, not a deliverable: no step.
			milestoneId: !isBug && steps.some((s) => s.id === milestoneId) ? milestoneId : null
		});
		if (!task) return;
		open = false;
		toasts.show(isIdea ? 'Idée notée' : isBug ? 'Bug noté' : 'Tâche ajoutée', {
			tone: 'success',
			action: { label: 'Ouvrir', run: () => overlays.openTask(task.id) }
		});
	}
</script>

<Dialog
	bind:open
	size="lg"
	title={isIdea ? 'Noter une idée' : seed.kind === 'bug' ? 'Signaler un bug' : 'Nouvelle tâche'}
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
				placeholder={isIdea
					? 'L’idée en quelques mots'
					: seed.kind === 'bug'
						? 'Qu’est-ce qui ne marche pas ?'
						: 'Que faut-il faire ?'}
				class="h-12 w-full rounded-xl border border-line bg-surface px-4 text-lg font-medium outline-none placeholder:font-normal focus:border-accent focus:ring-3 focus:ring-accent-soft"
			/>
			{#if parsedPerson || parsed.dueDate || parsed.kindSaid || parsedModule || parsed.reportedBy || parsedFraming}
				<p class="flex flex-wrap gap-2 text-sm">
					{#if parsed.reportedBy}
						<span
							class="inline-flex items-center gap-1 rounded-md bg-accent-soft px-2 py-0.5 font-medium text-accent-text"
						>
							Signalé par {parsed.reportedBy}
						</span>
					{/if}
					{#if parsed.kindSaid}
						{@const meta = KINDS[parsed.kind]}
						<span
							class="inline-flex items-center gap-1 rounded-md bg-accent-soft px-2 py-0.5 font-medium text-accent-text"
						>
							<meta.icon size={13} />{parsed.critical ? 'Bug bloquant' : meta.label}
						</span>
					{/if}
					{#if parsedFraming}
						<span
							class="inline-flex items-center gap-1 rounded-md bg-accent-soft px-2 py-0.5 font-medium text-accent-text"
						>
							<Layers size={13} />{parsedFraming}
						</span>
					{/if}
					{#if parsedModule}
						<span
							class="inline-flex items-center gap-1 rounded-md bg-accent-soft px-2 py-0.5 font-medium text-accent-text"
						>
							<Puzzle size={13} />{parsedModule.name}
						</span>
					{/if}
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
								'inline-flex h-10 items-center gap-2 rounded-full border px-3 text-sm font-medium transition-colors',
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

		{#if !parsed.kindSaid}
			<Field label="Type">
				<KindPicker value={kind} onchange={(k) => (kindChosen = k)} />
			</Field>
		{/if}
		{#if isBug}
			<label class="flex min-h-10 items-center gap-2.5 text-base">
				<input
					type="checkbox"
					checked={isCritical}
					disabled={parsed.critical}
					onchange={(e) => (critical = e.currentTarget.checked)}
					class="size-5 accent-[var(--color-danger)]"
				/>
				<span
					><span class="font-medium">Bloquant</span>
					<span class="text-ink-3"
						>· la prod ou un client est bloqué : il passe devant et toute l’équipe est prévenue</span
					></span
				>
			</label>
			{#if !parsed.reportedBy}<Field label="Signalé par (facultatif)" for="reported-by">
					<input
						id="reported-by"
						bind:value={reportedBy}
						list="new-reporters"
						maxlength={80}
						placeholder="Ex. : Pharmacie Martin"
						class="h-11 w-full rounded-xl border border-line-strong/70 bg-surface px-3.5 text-base outline-none placeholder:text-ink-3 focus:border-accent focus:ring-4 focus:ring-accent-soft"
					/>
					<datalist id="new-reporters">
						{#each reporters(app, projectId) as name (name)}<option value={name}></option>{/each}
					</datalist>
				</Field>{/if}
		{/if}
		{#if modules.length && !parsedModule}
			<Field label="Module">
				<ComponentPicker
					options={modules}
					value={componentId}
					onchange={(id) => (componentId = id)}
				/>
			</Field>
		{/if}
		{#if !isIdea && !isCritical}
			<!-- A bug is sorted later, together: blocking or not is all it needs now. -->
			{#if !isBug}
				<Field label="Priorité">
					<QuadrantPicker value={quadrant} onchange={(q) => (quadrant = q)} />
				</Field>
			{/if}
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
		{#if steps.length && !isBug}
			<Field label="Étape">
				<StepPicker {steps} value={milestoneId} onchange={(id) => (milestoneId = id)} />
			</Field>
		{/if}
		<Field label="Notes (facultatif)">
			<TextArea
				bind:value={notes}
				rows={2}
				placeholder={isBug
					? 'Ce qui se passe, ce qui devrait se passer, comment le reproduire'
					: 'Détails, liens…'}
			/>
		</Field>
	</form>
	{#snippet footer()}
		<Button variant="ghost" onclick={() => (open = false)}>Annuler</Button>
		<Button type="submit" form="task-form" variant="primary" disabled={!parsed.title.trim()}>
			{isIdea ? 'Noter l’idée' : isBug ? 'Noter le bug' : 'Créer la tâche'}
		</Button>
	{/snippet}
</Dialog>
