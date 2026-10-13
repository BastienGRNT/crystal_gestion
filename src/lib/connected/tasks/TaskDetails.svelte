<script lang="ts">
	import { Ellipsis, Link, Trash2, X } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import { relativeTime } from '$lib/client/format';
	import { tint } from '$lib/client/labels';
	import { now } from '$lib/client/now.svelte';
	import { toasts } from '$lib/client/toasts.svelte';
	import type { Task, TaskStatus } from '$lib/modules/tasks/domain/task';
	import IconButton from '$lib/ui/atoms/IconButton.svelte';
	import TextArea from '$lib/ui/atoms/TextArea.svelte';
	import DuePicker from '$lib/ui/molecules/DuePicker.svelte';
	import Menu from '$lib/ui/molecules/Menu.svelte';
	import PeoplePicker from '$lib/ui/molecules/PeoplePicker.svelte';
	import QuadrantPicker from '$lib/ui/molecules/QuadrantPicker.svelte';
	import StatusSteps from '$lib/ui/molecules/StatusSteps.svelte';
	import { teamOrder } from '../team/usePresence.svelte';
	import BlockButton from './BlockButton.svelte';
	import Checklist from './Checklist.svelte';
	import TaskComments from './TaskComments.svelte';

	let { task, onclose }: { task: Task; onclose: () => void } = $props();
	const { app, actions } = useApp();

	const project = $derived(app.projects.get(task.projectId));
	const author = $derived(app.users.get(task.createdBy));
	const people = $derived(teamOrder(app, task.projectId));
	const active = $derived(task.status === 'todo' || task.status === 'doing');

	// Drafts: what is being typed is never replaced by a live update.
	let title = $state('');
	let notes = $state('');
	let editing = $state<'title' | 'notes' | null>(null);
	$effect(() => {
		if (editing !== 'title') title = task.title;
		if (editing !== 'notes') notes = task.notes;
	});

	function save(field: 'title' | 'notes') {
		editing = null;
		const value = field === 'title' ? title.trim() : notes;
		if (field === 'title' && !value) return void (title = task.title);
		if (value !== task[field]) actions.tasks.update(task.id, { [field]: value });
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
			onblur={() => save('title')}
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

		<dl class="mt-6 flex flex-col gap-6">
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

			<div class="flex flex-col gap-2.5">
				{@render section('Échéance')}
				<dd>
					<DuePicker
						value={task.dueDate}
						today={now.today}
						onchange={(dueDate) => actions.tasks.update(task.id, { dueDate })}
					/>
				</dd>
			</div>

			<div class="flex flex-col gap-2.5">
				{@render section('Étapes')}
				<dd><Checklist {task} /></dd>
			</div>

			<div class="flex flex-col gap-2.5">
				{@render section('Notes')}
				<dd>
					<TextArea
						bind:value={notes}
						aria-label="Notes"
						placeholder="Détails, liens, ce qui veut dire « fini »…"
						class="min-h-24"
						maxHeight={480}
						onfocus={() => (editing = 'notes')}
						onblur={() => save('notes')}
					/>
				</dd>
			</div>

			<div class="flex flex-col gap-2.5">
				{@render section('Commentaires')}
				<dd><TaskComments {task} /></dd>
			</div>
		</dl>
	</div>
</div>
