<script lang="ts">
	import {
		ArrowRight,
		Compass,
		Hourglass,
		ListChecks,
		MessageCircleQuestion,
		MessageSquare,
		OctagonAlert
	} from '@lucide/svelte';
	import { BOXES, KINDS } from '$lib/client/labels';
	import type { Task } from '$lib/modules/tasks/domain/task';
	import Avatar from '../atoms/Avatar.svelte';
	import DueDate from '../atoms/DueDate.svelte';
	import StatusCheck from '../atoms/StatusCheck.svelte';
	import type { Person } from '../types';

	interface Props {
		task: Task;
		assignee: Person | undefined;
		reviewer?: Person | undefined;
		today: string;
		/** In "À faire" the group already says it. */
		showPriority?: boolean;
		comments?: number;
		/** Days in this column, shown once a card stops moving. */
		staleDays?: number | null;
		/** Teammates asked a question in its thread: the card waits on them. */
		waitingOn?: string;
		/** Label of the one-click move to the next column ("Commencer", "À relire"…). */
		next?: string | null;
		/** The step it belongs to, when not the one on screen. */
		step?: string;
		/** Its module, when the project has several. */
		component?: { name: string; color: string };
		onopen: () => void;
		oncomplete: () => void;
		onreopen: () => void;
		onnext?: () => void;
	}

	let {
		task,
		assignee,
		reviewer,
		today,
		showPriority = true,
		comments = 0,
		staleDays = null,
		waitingOn,
		next = null,
		step,
		component,
		onopen,
		oncomplete,
		onreopen,
		onnext
	}: Props = $props();

	const box = $derived(BOXES[task.quadrant ?? 'inbox']);
	const done = $derived(task.status === 'done');
	const steps = $derived(task.checklist.filter((s) => s.done).length);
	const kind = $derived(KINDS[task.kind]);
</script>

<div
	role="button"
	tabindex="0"
	onclick={onopen}
	onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onopen())}
	class={[
		'group relative flex cursor-pointer touch-manipulation flex-col gap-2.5 overflow-hidden rounded-xl border bg-surface py-3 pr-3 pl-4 shadow-card transition-[border-color,box-shadow,transform] select-none hover:-translate-y-px hover:shadow-raise',
		task.blockedReason || (task.critical && !done)
			? 'border-danger/50'
			: 'border-line hover:border-line-strong',
		done && 'opacity-75'
	]}
>
	<!-- The priority reads from the edge, without having to read the card. -->
	<span class={['absolute inset-y-0 left-0 w-1', done ? 'bg-ok' : box.dot]} aria-hidden="true"
	></span>

	{#if showPriority && !done}
		<p class={['text-xs font-semibold', box.text]}>{box.label}</p>
	{/if}

	<div class="flex items-start gap-2.5">
		<span class="pt-0.5"
			><StatusCheck
				status={task.status}
				title={task.title}
				{oncomplete}
				{onreopen}
				size="sm"
			/></span
		>
		<p
			class={[
				'line-clamp-3 min-w-0 flex-1 text-base leading-snug font-medium',
				done && 'text-ink-3 line-through decoration-ink-4'
			]}
		>
			{task.title}
		</p>
	</div>

	{#if task.blockedReason}
		<p
			class="flex items-start gap-1.5 rounded-lg bg-danger-soft px-2 py-1.5 text-sm font-medium text-danger-text"
		>
			<OctagonAlert size={14} class="mt-0.5 shrink-0" />{task.blockedReason}
		</p>
	{/if}

	{#if waitingOn && !done}
		<p
			class="flex items-start gap-1.5 rounded-lg bg-warn-soft px-2 py-1.5 text-sm font-medium text-warn-text"
		>
			<MessageCircleQuestion size={14} class="mt-0.5 shrink-0" />Attend la réponse de {waitingOn}
		</p>
	{/if}

	<div class="flex min-h-6 flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-3">
		{#if task.critical && !done}
			<span
				class="inline-flex items-center gap-1 rounded-md bg-danger px-1.5 text-xs font-semibold text-white"
				><kind.icon size={12} />Bloquant</span
			>
		{:else if task.kind === 'bug'}
			<span
				class={[
					'inline-flex items-center gap-1 rounded-md px-1.5 text-xs font-semibold',
					kind.chip
				]}><kind.icon size={12} />Bug</span
			>
		{:else if task.kind !== 'feature'}
			<span class={['inline-flex', kind.text]} title={kind.label}
				><kind.icon size={14} aria-label={kind.label} /></span
			>
		{/if}
		{#if component}<span
				class="inline-flex max-w-32 items-center gap-1 text-xs font-medium text-ink-2"
				title="Module : {component.name}"
				><span class="size-2 shrink-0 rounded-[3px]" style:background-color={component.color}
				></span><span class="truncate">{component.name}</span></span
			>{/if}
		{#if step}<span
				class="inline-flex max-w-40 items-center gap-1 rounded-md bg-sunken px-1.5 text-xs font-medium text-ink-2"
				title="Étape : {step}"
				><Compass size={12} class="shrink-0" /><span class="truncate">{step}</span></span
			>{/if}
		{#if task.dueDate}<DueDate date={task.dueDate} {today} {done} />{/if}
		{#if task.checklist.length}
			<span
				class={[
					'inline-flex items-center gap-1',
					steps === task.checklist.length && 'text-ok-text'
				]}
				title="Étapes faites"
			>
				<ListChecks size={14} />{steps}/{task.checklist.length}
			</span>
		{/if}
		{#if comments}<span class="inline-flex items-center gap-1" title="Commentaires"
				><MessageSquare size={14} />{comments}</span
			>{/if}
		{#if staleDays !== null}
			<span
				class="inline-flex items-center gap-1 font-medium text-warn-text"
				title="Sans bouger depuis {staleDays} jours"
			>
				<Hourglass size={14} />{staleDays} j
			</span>
		{/if}
		<span class="ml-auto flex items-center gap-2">
			{#if task.number}<span class="font-mono text-xs text-ink-3">#{task.number}</span>{/if}
		</span>
		<span class="flex items-center -space-x-1">
			{#if reviewer}<span title="Relu par {reviewer.name}"
					><Avatar
						name={reviewer.name}
						color={reviewer.color}
						size="xs"
						ring="ring-surface"
					/></span
				>{/if}
			{#if assignee}<Avatar name={assignee.name} color={assignee.color} size="sm" />{/if}
		</span>
	</div>

	{#if next && onnext}
		<button
			data-no-drag
			onclick={(e) => (e.stopPropagation(), onnext())}
			class="absolute top-2 right-2 hidden h-9 items-center gap-1 rounded-lg border border-line bg-surface px-2.5 text-xs font-semibold text-ink-2 shadow-raise group-focus-within:inline-flex group-hover:inline-flex hover:border-accent hover:text-accent-text [@media(hover:none)]:inline-flex"
		>
			{next}<ArrowRight size={13} />
		</button>
	{/if}
</div>
