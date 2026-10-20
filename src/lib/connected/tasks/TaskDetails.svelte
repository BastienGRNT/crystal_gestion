<script lang="ts">
	import {
		Check,
		Ellipsis,
		FlaskConical,
		Gavel,
		GitBranch,
		GitCommitHorizontal,
		Rocket,
		Link,
		Trash2,
		TriangleAlert,
		X
	} from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import { relativeTime, shortDay } from '$lib/client/format';
	import { tint } from '$lib/client/labels';
	import { now } from '$lib/client/now.svelte';
	import { toasts } from '$lib/client/toasts.svelte';
	import { branchName, commitMessage } from '$lib/modules/tasks/domain/kind';
	import type { Task, TaskStatus } from '$lib/modules/tasks/domain/task';
	import IconButton from '$lib/ui/atoms/IconButton.svelte';
	import TextArea from '$lib/ui/atoms/TextArea.svelte';
	import ComponentPicker from '$lib/ui/molecules/ComponentPicker.svelte';
	import DuePicker from '$lib/ui/molecules/DuePicker.svelte';
	import KindPicker from '$lib/ui/molecules/KindPicker.svelte';
	import ProseField from '$lib/ui/molecules/ProseField.svelte';
	import Menu from '$lib/ui/molecules/Menu.svelte';
	import PeoplePicker from '$lib/ui/molecules/PeoplePicker.svelte';
	import QuadrantPicker from '$lib/ui/molecules/QuadrantPicker.svelte';
	import StatusSteps from '$lib/ui/molecules/StatusSteps.svelte';
	import StepPicker from '$lib/ui/molecules/StepPicker.svelte';
	import Button from '$lib/ui/atoms/Button.svelte';
	import { stepOptions } from '../roadmap/step-options';
	import { supersededIds } from '$lib/modules/roadmap/domain/decision';
	import { teamOrder } from '../team/usePresence.svelte';
	import TaskFraming from '../framing/TaskFraming.svelte';
	import BlockButton from './BlockButton.svelte';
	import Checklist from './Checklist.svelte';
	import { componentOptions, reporters } from './components-of';
	import { riskOf } from './risk';
	import TaskComments from './TaskComments.svelte';

	let { task, onclose }: { task: Task; onclose: () => void } = $props();
	const { app, actions, overlays } = useApp();

	const project = $derived(app.projects.get(task.projectId));
	const author = $derived(app.users.get(task.createdBy));
	const people = $derived(teamOrder(app, task.projectId));
	const active = $derived(task.status === 'todo' || task.status === 'doing');
	// Said right where the date is chosen: a deadline nobody has time for is visible at once.
	const risk = $derived(riskOf(app, task));
	const steps = $derived(stepOptions(app, task.projectId));
	const step = $derived(app.milestones.get(task.milestoneId));
	const decisions = $derived(app.decisions.all.filter((d) => d.taskId === task.id));
	const replaced = $derived(supersededIds(app.decisions.all));
	// The bet this task checks: once done, the drawer asks how it turned out.
	const hypothesis = $derived(
		app.hypotheses.all.find((h) => h.taskId === task.id && h.verdict === 'open')
	);
	const modules = $derived(componentOptions(app, task.projectId));
	const release = $derived(app.releases.get(task.releaseId));
	const shipsReleases = $derived(app.releases.all.some((r) => r.projectId === task.projectId));
	const branch = $derived(branchName(task));
	const commit = $derived(commitMessage(task, app.components.get(task.componentId)?.name ?? null));
	let reportedBy = $state('');
	$effect(() => {
		if (editing !== 'reportedBy') reportedBy = task.reportedBy ?? '';
	});

	async function copy(text: string, what: string) {
		await navigator.clipboard.writeText(text).catch(() => {});
		toasts.show(`${what} copié : ${text}`, { tone: 'success', duration: 2500 });
	}

	const decide = () => overlays.decide({ projectId: task.projectId, text: '', taskId: task.id });

	// Drafts: what is being typed is never replaced by a live update.
	let title = $state('');
	let editing = $state<'title' | 'reportedBy' | null>(null);
	$effect(() => {
		if (editing !== 'title') title = task.title;
	});

	function saveTitle() {
		editing = null;
		const value = title.trim();
		if (!value) return void (title = task.title);
		if (value !== task.title) actions.tasks.update(task.id, { title: value });
	}

	function saveReporter() {
		editing = null;
		const value = reportedBy.trim() || null;
		if (value !== task.reportedBy) actions.tasks.update(task.id, { reportedBy: value });
	}

	async function copyLink() {
		await navigator.clipboard.writeText(location.href).catch(() => {});
		toasts.show('Lien copié', { tone: 'success', duration: 2000 });
	}
</script>

{#snippet section(label: string)}
	<dt class="text-sm font-semibold text-ink-2">{label}</dt>
{/snippet}

<div class="flex h-full flex-col">
	<header class="flex h-16 shrink-0 items-center gap-2 border-b border-line px-5">
		{#if project}
			<span class="flex min-w-0 items-center gap-2 text-sm font-medium text-ink-2">
				<span class="size-3 shrink-0 rounded-[4px]" style:background-color={tint(project.color)}
				></span>
				<span class="truncate">{project.name}</span>
			</span>
		{/if}
		{#if task.number}<span class="font-mono text-sm text-ink-3">#{task.number}</span>{/if}
		<div class="ml-auto flex items-center gap-1">
			<Menu
				label="Plus d’options"
				items={[
					{ label: 'Copier le lien', icon: Link, run: copyLink },
					...(branch
						? [
								{
									label: 'Copier le nom de branche',
									icon: GitBranch,
									run: () => copy(branch, 'Nom de branche')
								},
								{
									label: 'Copier le message de commit',
									icon: GitCommitHorizontal,
									run: () => copy(commit ?? '', 'Message de commit')
								}
							]
						: []),
					{ label: 'Noter une décision', icon: Gavel, run: decide },
					'separator',
					{
						label: 'Supprimer la tâche',
						icon: Trash2,
						danger: true,
						run: () => (onclose(), actions.tasks.remove(task.id))
					}
				]}
			>
				{#snippet trigger({ props })}<IconButton
						icon={Ellipsis}
						label="Plus d’options"
						{...props}
					/>{/snippet}
			</Menu>
			<IconButton icon={X} label="Fermer" onclick={onclose} />
		</div>
	</header>

	<div class="flex-1 scrollbar-thin overflow-y-auto px-5 py-5">
		<TextArea
			bare
			bind:value={title}
			aria-label="Titre"
			class="text-xl leading-snug font-semibold tracking-tight"
			onfocus={() => (editing = 'title')}
			onblur={saveTitle}
			onkeydown={(e) => {
				if (e.key !== 'Enter') return;
				e.preventDefault();
				e.currentTarget.blur();
			}}
		/>
		<p class="mt-1 text-sm text-ink-3">
			Ajoutée par {author?.name ?? 'quelqu’un'}
			{relativeTime(task.createdAt, now.value)}
		</p>

		{#if hypothesis}
			<div
				class="mt-5 flex flex-col gap-2.5 rounded-xl border border-plan/30 bg-plan-soft px-4 py-3"
			>
				<p class="flex items-start gap-2 text-base">
					<FlaskConical size={17} class="mt-0.5 shrink-0 text-plan-text" aria-hidden="true" />
					<span
						>{task.status === 'done' ? 'Alors, c’est vrai ?' : 'Cette tâche vérifie'}
						<span class="font-semibold">« {hypothesis.text} »</span></span
					>
				</p>
				{#if task.status === 'done'}
					<div class="flex flex-wrap gap-2">
						<Button
							size="sm"
							icon={Check}
							onclick={() => actions.roadmap.judge(hypothesis.id, 'true')}>C’est vrai</Button
						>
						<Button size="sm" icon={X} onclick={() => actions.roadmap.judge(hypothesis.id, 'false')}
							>C’est faux</Button
						>
					</div>
				{/if}
			</div>
		{/if}

		{#if release}
			<p class="mt-3 flex items-center gap-1.5 text-sm font-medium text-ok-text">
				<Rocket size={14} aria-hidden="true" />En prod depuis {release.name} ({shortDay(
					release.shippedAt.slice(0, 10)
				)})
			</p>
		{:else if task.status === 'done' && shipsReleases && task.kind !== 'action'}
			<p class="mt-3 flex items-center gap-1.5 text-sm text-ink-3">
				<Rocket size={14} aria-hidden="true" />Terminée, pas encore en prod
			</p>
		{/if}

		<TaskFraming {task} />

		<dl class="mt-6 flex flex-col gap-6">
			<div class="flex flex-col gap-2.5">
				{@render section('Type')}
				<dd class="flex flex-col gap-3">
					<KindPicker
						value={task.kind}
						onchange={(kind) => actions.tasks.update(task.id, { kind })}
					/>
					{#if task.kind === 'bug'}
						<label class="flex min-h-10 items-center gap-2.5 text-base">
							<input
								type="checkbox"
								checked={task.critical}
								class="size-5 accent-[var(--color-danger)]"
								onchange={(e) =>
									actions.tasks.update(task.id, { critical: e.currentTarget.checked })}
							/>
							<span
								><span class="font-medium">Bloquant</span>
								<span class="text-ink-3"
									>· la prod ou un client est bloqué : toute l’équipe est prévenue</span
								></span
							>
						</label>
						<label class="flex flex-col gap-1">
							<span class="text-sm font-medium text-ink-2">Signalé par</span>
							<input
								bind:value={reportedBy}
								list="reporters-{task.projectId}"
								maxlength={80}
								placeholder="Ex. : Pharmacie Martin"
								class="h-11 rounded-xl border border-line-strong/70 bg-surface px-3.5 text-base outline-none placeholder:text-ink-3 focus:border-accent focus:ring-4 focus:ring-accent-soft"
								onfocus={() => (editing = 'reportedBy')}
								onblur={saveReporter}
								onkeydown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
							/>
							<datalist id="reporters-{task.projectId}">
								{#each reporters(app, task.projectId) as name (name)}<option value={name}
									></option>{/each}
							</datalist>
						</label>
					{/if}
				</dd>
			</div>

			{#if modules.length}
				<div class="flex flex-col gap-2.5">
					{@render section('Module')}
					<dd>
						<ComponentPicker
							options={modules}
							value={task.componentId}
							onchange={(componentId) => actions.tasks.update(task.id, { componentId })}
						/>
					</dd>
				</div>
			{/if}

			<div class="flex flex-col gap-2.5">
				{@render section('Où en est-elle')}
				<dd class="flex flex-col gap-2">
					<StatusSteps
						value={task.status}
						onchange={(status: TaskStatus) => actions.tasks.update(task.id, { status })}
					/>
					<div class="flex items-center gap-2">
						<BlockButton {task} size="sm" />
						{#if task.blockedReason}<p class="text-sm font-medium text-danger-text">
								{task.blockedReason}
							</p>{/if}
					</div>
				</dd>
			</div>

			{#if active}
				<div class="flex flex-col gap-2.5">
					{@render section('Priorité')}
					<dd>
						<QuadrantPicker
							value={task.quadrant}
							onchange={(quadrant) => actions.tasks.update(task.id, { quadrant })}
						/>
					</dd>
				</div>
			{/if}

			<div class="flex flex-col gap-2.5">
				{@render section('Qui s’en occupe')}
				<dd>
					<PeoplePicker
						{people}
						meId={app.meId}
						value={task.assigneeId}
						onchange={(assigneeId) => actions.tasks.update(task.id, { assigneeId })}
					/>
				</dd>
			</div>

			{#if task.status === 'review' || task.reviewerId}
				<div class="flex flex-col gap-2.5">
					{@render section('Qui relit')}
					<dd>
						<PeoplePicker
							people={people.filter((p) => p.id !== task.assigneeId)}
							meId={app.meId}
							value={task.reviewerId}
							none="Personne"
							label="Qui relit"
							onchange={(reviewerId) => actions.tasks.update(task.id, { reviewerId })}
						/>
					</dd>
				</div>
			{/if}

			{#if step?.closedAt}
				<div class="flex flex-col gap-2.5">
					{@render section('Étape')}
					<dd class="text-base text-ink-2">{step.title} (close)</dd>
				</div>
			{:else if steps.length}
				<div class="flex flex-col gap-2.5">
					{@render section('Étape')}
					<dd>
						<StepPicker
							{steps}
							value={task.milestoneId}
							onchange={(milestoneId) => actions.tasks.update(task.id, { milestoneId })}
						/>
					</dd>
				</div>
			{/if}

			<div class="flex flex-col gap-2.5">
				{@render section('Échéance')}
				<dd class="flex flex-col gap-2">
					<DuePicker
						value={task.dueDate}
						today={now.today}
						onchange={(dueDate) => actions.tasks.update(task.id, { dueDate })}
					/>
					{#if risk}
						<p
							class={[
								'flex items-center gap-1.5 text-sm font-medium',
								risk.tone === 'danger' ? 'text-danger-text' : 'text-warn-text'
							]}
						>
							<TriangleAlert size={14} class="shrink-0" />{risk.text}
						</p>
					{/if}
				</dd>
			</div>

			<div class="flex flex-col gap-2.5">
				{@render section('Étapes')}
				<dd><Checklist {task} /></dd>
			</div>

			<div class="flex flex-col gap-2.5">
				{@render section('Notes')}
				<dd>
					<ProseField
						label="Notes"
						value={task.notes}
						maxlength={20000}
						placeholder={task.kind === 'bug'
							? 'Ce qui se passe, ce qui devrait se passer, comment le reproduire (appareil, compte, lien)'
							: 'Détails, liens, ce qui veut dire « fini »…'}
						onsave={(notes) => actions.tasks.update(task.id, { notes })}
					/>
				</dd>
			</div>

			{#if decisions.length}
				<div class="flex flex-col gap-2.5">
					{@render section('Décisions')}
					<dd>
						<ul class="flex flex-col gap-1.5">
							{#each decisions as decision (decision.id)}
								<li class="flex items-start gap-2 text-base">
									<Gavel size={15} class="mt-1 shrink-0 text-ok-text" aria-hidden="true" />
									<span class={replaced.has(decision.id) ? 'text-ink-3 line-through' : ''}
										>{decision.text}</span
									>
								</li>
							{/each}
						</ul>
					</dd>
				</div>
			{/if}

			<div class="flex flex-col gap-2.5">
				{@render section('Commentaires')}
				<dd><TaskComments {task} /></dd>
			</div>
		</dl>
	</div>
</div>
