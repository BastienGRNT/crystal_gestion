<script lang="ts">
	import { ChevronDown, CircleCheckBig, Gavel, GripVertical, Trash2 } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import { plural, shortDay } from '$lib/client/format';
	import { now } from '$lib/client/now.svelte';
	import type { StepForecast } from '$lib/client/views/roadmap';
	import type { Milestone } from '$lib/modules/roadmap/domain/milestone';
	import type { Task } from '$lib/modules/tasks/domain/task';
	import Button from '$lib/ui/atoms/Button.svelte';
	import IconButton from '$lib/ui/atoms/IconButton.svelte';
	import DateChip from '$lib/ui/molecules/DateChip.svelte';
	import EditableText from '$lib/ui/molecules/EditableText.svelte';
	import InlineAdd from '$lib/ui/molecules/InlineAdd.svelte';
	import ProseField from '$lib/ui/molecules/ProseField.svelte';
	import TaskRow from '$lib/ui/organisms/TaskRow.svelte';
	import ComponentPicker from '$lib/ui/molecules/ComponentPicker.svelte';
	import { componentOptions } from '../tasks/components-of';
	import { QUICK_HINT, quickAdd } from '../tasks/quick-add';
	import { epicIdOf, epicProgress } from '$lib/client/views/framing';
	import { paceText } from './step-text';

	interface Props {
		step: Milestone;
		forecast: StepForecast | undefined;
		number: number;
		current: boolean;
		/** Its date comes before a step placed earlier: worth a word. */
		outOfOrder: boolean;
		onclose: () => void;
	}

	let { step, forecast, number, current, outOfOrder, onclose }: Props = $props();
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
	const closed = $derived(!!step.closedAt);
	const modules = $derived(componentOptions(app, step.projectId));
	const module = $derived(modules.find((m) => m.id === step.componentId));
	// The epics this step moves forward, from its tasks: nothing to link by hand.
	const epics = $derived.by(() => {
		const ids = new Set(tasks.map((t) => epicIdOf(t, app.stories.all)).filter(Boolean));
		return app.epics.all
			.filter((e) => ids.has(e.id))
			.map((e) => ({ epic: e, progress: epicProgress(e, app.stories.all, app.tasks.all) }));
	});
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
	aria-label="Étape {number} : {step.title}"
	class={[
		'scroll-mt-6 rounded-2xl border bg-surface shadow-card',
		current ? 'border-accent/40' : 'border-line',
		closed && 'bg-surface-2'
	]}
>
	<div class="flex items-start gap-2 px-3 pt-3 pb-2 sm:px-4">
		{#if !closed}
			<button
				type="button"
				data-drag-handle
				aria-label="Glisser pour déplacer l’étape"
				title="Glisser pour déplacer"
				class="-ml-1 flex size-10 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg text-ink-3 hover:bg-hover hover:text-ink-2 active:cursor-grabbing"
			>
				<GripVertical size={18} aria-hidden="true" />
			</button>
		{/if}
		<span
			class={[
				'mt-1.5 flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
				closed
					? 'bg-ok-soft text-ok-text'
					: current
						? 'bg-accent text-accent-ink'
						: 'bg-sunken text-ink-2'
			]}
		>
			{#if closed}<CircleCheckBig size={15} />{:else}{number}{/if}
		</span>
		<div class="flex min-w-0 flex-1 flex-col gap-1">
			<div class="flex flex-wrap items-center gap-x-2 gap-y-1">
				<EditableText
					label="Nom de l’étape"
					value={step.title}
					maxlength={80}
					class={['text-lg font-semibold tracking-tight', closed && 'text-ink-2'].join(' ')}
					onsave={(title) => actions.roadmap.updateStep(step.id, { title })}
				/>
				{#if module}<span class="inline-flex items-center gap-1.5 text-sm font-medium text-ink-2"
						><span class="size-2.5 rounded-[3px]" style:background-color={module.color}
						></span>{module.name}</span
					>{/if}
				{#if current}<span class="text-sm font-medium text-accent-text">en cours</span>{/if}
			</div>
			<div class="flex flex-wrap items-center gap-2 text-sm text-ink-3">
				{#if closed}
					<span
						>Close le {shortDay(step.closedAt!.slice(0, 10))}{step.targetDate
							? ` · prévue le ${shortDay(step.targetDate)}`
							: ''}</span
					>
				{:else}
					<DateChip
						value={step.targetDate}
						today={now.today}
						label="Date de l’étape"
						text={step.targetDate ? `Pour le ${shortDay(step.targetDate)}` : 'Sans date'}
						askReason
						tone={late ? 'danger' : outOfOrder ? 'warn' : 'neutral'}
						onchange={(targetDate, reason) =>
							actions.roadmap.updateStep(step.id, { targetDate }, reason)}
					/>
					{#if pace}<span class={late ? 'font-medium text-danger-text' : ''}>{pace}</span>{/if}
					{#if outOfOrder}<span class="text-warn-text">prévue avant l’étape d’avant</span>{/if}
				{/if}
			</div>
		</div>
		<span class="mt-2.5 shrink-0 text-sm font-medium text-ink-2 tabular-nums"
			>{forecast?.done ?? 0}/{forecast?.total ?? 0}</span
		>
		<IconButton
			icon={ChevronDown}
			label={expanded ? 'Replier l’étape' : 'Déplier l’étape'}
			aria-expanded={expanded}
			class={['shrink-0 transition-transform', expanded && 'rotate-180']}
			onclick={() => (toggled = !expanded)}
		/>
	</div>

	<div class="flex flex-col gap-3 px-4 pb-4" data-no-drag>
		<div class="h-1.5 overflow-hidden rounded-full bg-sunken" aria-hidden="true">
			<div
				class={['h-full rounded-full', closed ? 'bg-ok' : late ? 'bg-danger' : 'bg-accent']}
				style:width="{Math.round((closed ? 1 : progress) * 100)}%"
			></div>
		</div>

		{#if expanded || step.doneWhen}
			<div class="flex flex-col gap-0.5">
				<span class="text-xs font-semibold tracking-wide text-ink-3 uppercase"
					>C’est fini quand</span
				>
				<ProseField
					label="C’est fini quand"
					value={step.doneWhen}
					maxlength={1000}
					placeholder="Ce qui doit être vrai pour la clore. Ex. : 3 pharmacies l’utilisent sans nous appeler"
					onsave={(doneWhen) => actions.roadmap.updateStep(step.id, { doneWhen })}
				/>
			</div>
		{/if}

		{#if epics.length}
			<p class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-3">
				<span>Fait avancer</span>
				{#each epics as { epic, progress: p } (epic.id)}
					<a
						href="/p/{app.projects.get(step.projectId)?.slug}/cadrage/fonctionnel#stories"
						class="font-medium text-ink-2 hover:text-accent-text"
						>{epic.title}{#if p.total}<span class="font-normal text-ink-3 tabular-nums">
								· {p.delivered}/{p.total}</span
							>{/if}</a
					>
				{/each}
			</p>
		{/if}

		{#if !closed && forecast?.ready}
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
				{#if !open.length && !closed}
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
			{#if modules.length && !closed}
				<div class="flex flex-col gap-1">
					<span class="text-xs font-semibold tracking-wide text-ink-3 uppercase"
						>Module · chaque module avance en parallèle</span
					>
					<ComponentPicker
						options={modules}
						value={step.componentId}
						onchange={(componentId) => actions.roadmap.updateStep(step.id, { componentId })}
					/>
				</div>
			{/if}
			{#if !closed}
				<InlineAdd
					label="Ajouter une tâche"
					hint={QUICK_HINT}
					onadd={(text) =>
						quickAdd(context, text, {
							projectId: step.projectId,
							milestoneId: step.id,
							componentId: step.componentId
						})}
				/>
			{/if}
			<div class="flex flex-wrap items-center gap-2 border-t border-line pt-3">
				{#if !closed}
					<Button size="sm" icon={CircleCheckBig} onclick={onclose}>Clore l’étape</Button>
				{/if}
				<Button
					size="sm"
					variant="ghost"
					icon={Gavel}
					onclick={() =>
						overlays.decide({ projectId: step.projectId, text: '', milestoneId: step.id })}
					>Noter une décision</Button
				>
				<Button
					size="sm"
					variant="ghost"
					icon={Trash2}
					class="ml-auto text-danger-text"
					onclick={() => actions.roadmap.removeStep(step)}>Supprimer</Button
				>
			</div>
		{/if}
	</div>
</section>
