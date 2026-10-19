<script lang="ts">
	import {
		ArrowDown,
		ArrowUp,
		ChevronDown,
		CircleCheckBig,
		Ellipsis,
		Gavel,
		Pencil,
		Trash2
	} from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import { plural, shortDay } from '$lib/client/format';
	import { now } from '$lib/client/now.svelte';
	import type { StepForecast } from '$lib/client/views/roadmap';
	import type { Milestone } from '$lib/modules/roadmap/domain/milestone';
	import type { Task } from '$lib/modules/tasks/domain/task';
	import Button from '$lib/ui/atoms/Button.svelte';
	import IconButton from '$lib/ui/atoms/IconButton.svelte';
	import InlineAdd from '$lib/ui/molecules/InlineAdd.svelte';
	import Menu from '$lib/ui/molecules/Menu.svelte';
	import TaskRow from '$lib/ui/organisms/TaskRow.svelte';
	import type { MenuItem } from '$lib/ui/types';
	import { QUICK_HINT, quickAdd } from '../tasks/quick-add';
	import { paceText } from './step-text';

	interface Props {
		step: Milestone;
		forecast: StepForecast | undefined;
		number: number;
		current: boolean;
		onedit: () => void;
		onclose: () => void;
	}

	let { step, forecast, number, current, onedit, onclose }: Props = $props();
	const context = useApp();
	const { app, actions, overlays } = context;
	// The step under way is open; the others until someone opens or folds them.
	let toggled = $state<boolean | null>(null);
	const expanded = $derived(toggled ?? current);
	let showDone = $state(false);

	const tasks = $derived(app.tasks.all.filter((t) => t.milestoneId === step.id));
	const order = (a: Task, b: Task) => a.position - b.position;
	const open = $derived(
		tasks
			.filter((t) => t.status === 'todo' || t.status === 'doing' || t.status === 'review')
			.sort(order)
	);
	const ideas = $derived(tasks.filter((t) => t.status === 'idea').sort(order));
	const done = $derived(tasks.filter((t) => t.status === 'done'));
	const progress = $derived(forecast && forecast.total ? forecast.done / forecast.total : 0);
	const pace = $derived(paceText(forecast));
	const late = $derived(forecast?.state === 'late');

	const menu = $derived<(MenuItem | 'separator')[]>([
		{ label: 'Modifier', icon: Pencil, run: onedit },
		...(!step.targetDate && !step.closedAt
			? [
					{ label: 'Monter', icon: ArrowUp, run: () => actions.roadmap.moveStep(step.id, 'up') },
					{
						label: 'Descendre',
						icon: ArrowDown,
						run: () => actions.roadmap.moveStep(step.id, 'down')
					}
				]
			: []),
		{
			label: 'Noter une décision',
			icon: Gavel,
			run: () => overlays.decide({ projectId: step.projectId, text: '', milestoneId: step.id })
		},
		'separator',
		{
			label: 'Supprimer l’étape',
			icon: Trash2,
			danger: true,
			run: () => actions.roadmap.removeStep(step)
		}
	]);
</script>

{#snippet row(task: Task)}
	<TaskRow
		{task}
		assignee={app.users.get(task.assigneeId)}
		today={now.today}
		onopen={() => overlays.openTask(task.id)}
		oncomplete={() => actions.tasks.complete(task.id)}
	/>
{/snippet}

<section
	id="etape-{step.id}"
	class={[
		'scroll-mt-6 rounded-2xl border bg-surface shadow-card',
		current ? 'border-accent/40' : 'border-line',
		step.closedAt && 'bg-surface-2'
	]}
>
	<div class="flex items-start gap-3 px-4 pt-3.5 pb-3">
		<span
			class={[
				'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
				step.closedAt
					? 'bg-ok-soft text-ok-text'
					: current
						? 'bg-accent text-accent-ink'
						: 'bg-sunken text-ink-2'
			]}
		>
			{#if step.closedAt}<CircleCheckBig size={15} />{:else}{number}{/if}
		</span>
		<button
			class="min-w-0 flex-1 text-left"
			onclick={() => (toggled = !expanded)}
			aria-expanded={expanded}
		>
			<span class="flex flex-wrap items-baseline gap-x-2">
				<span class={['text-lg font-semibold tracking-tight', step.closedAt && 'text-ink-2']}
					>{step.title}</span
				>
				{#if current}<span class="text-sm font-medium text-accent-text">en cours</span>{/if}
			</span>
			<span class="block text-sm text-ink-3">
				{#if step.closedAt}
					Close le {shortDay(step.closedAt.slice(0, 10))}{step.targetDate
						? ` · prévue le ${shortDay(step.targetDate)}`
						: ''}
				{:else}
					{step.targetDate ? `Pour le ${shortDay(step.targetDate)}` : 'Sans date'}{#if pace}
						·
						<span class={late ? 'font-medium text-danger-text' : ''}>{pace}</span>{/if}
				{/if}
			</span>
		</button>
		<span class="mt-1 shrink-0 text-sm font-medium text-ink-2"
			>{forecast?.done ?? 0}/{forecast?.total ?? 0}</span
		>
		<Menu label="Options de l’étape" items={menu}>
			{#snippet trigger({ props })}<IconButton
					icon={Ellipsis}
					label="Options de l’étape"
					size="sm"
					{...props}
				/>{/snippet}
		</Menu>
	</div>

	<div class="flex flex-col gap-3 px-4 pb-4">
		<div class="h-1.5 overflow-hidden rounded-full bg-sunken" aria-hidden="true">
			<div
				class={['h-full rounded-full', step.closedAt ? 'bg-ok' : late ? 'bg-danger' : 'bg-accent']}
				style:width="{Math.round((step.closedAt ? 1 : progress) * 100)}%"
			></div>
		</div>
		{#if step.doneWhen}
			<p class="text-base text-ink-2">
				<span class="font-medium text-ink-3">Fini quand :</span>
				{step.doneWhen}
			</p>
		{/if}

		{#if current && forecast?.ready}
			<div class="flex flex-wrap items-center gap-3 rounded-xl bg-ok-soft px-4 py-3">
				<p class="min-w-0 flex-1 text-base font-medium text-ok-text">
					Tout est fait. C’est le cas ? Alors on la clôt.
				</p>
				<Button size="sm" variant="primary" icon={CircleCheckBig} onclick={onclose}>Clore</Button>
			</div>
		{:else if late && current}
			<p class="rounded-xl bg-danger-soft px-4 py-3 text-base text-danger-text">
				Au rythme actuel, elle déborde : passe des tâches en pistes, ou décale la date (c’est noté).
			</p>
		{/if}

		{#if expanded}
			<div class="flex flex-col">
				{#each open as task (task.id)}{@render row(task)}{/each}
				{#if !open.length && !step.closedAt}
					<p class="py-2 text-base text-ink-3">
						Rien d’ouvert. Ajoute ce qu’il faut pour la finir.
					</p>
				{/if}
				{#if ideas.length}
					<p class="mt-3 mb-1 text-xs font-semibold tracking-wide text-ink-3 uppercase">
						Pistes · si on a le temps
					</p>
					{#each ideas as task (task.id)}{@render row(task)}{/each}
				{/if}
				{#if done.length}
					<button
						class="mt-2 flex h-10 items-center gap-1.5 self-start rounded-lg px-2 text-sm text-ink-3 hover:bg-hover hover:text-ink-2"
						onclick={() => (showDone = !showDone)}
					>
						<ChevronDown size={15} class={showDone ? 'rotate-180' : ''} />
						{plural(done.length, 'tâche terminée', 'tâches terminées')}
					</button>
					{#if showDone}{#each done as task (task.id)}{@render row(task)}{/each}{/if}
				{/if}
			</div>
			{#if !step.closedAt}
				<InlineAdd
					label="Ajouter une tâche"
					hint={QUICK_HINT}
					onadd={(text) =>
						quickAdd(context, text, { projectId: step.projectId, milestoneId: step.id })}
				/>
			{/if}
		{/if}

		{#if current && !forecast?.ready}
			<Button size="sm" icon={CircleCheckBig} class="self-start" onclick={onclose}
				>Clore l’étape</Button
			>
		{/if}
	</div>
</section>
