<script lang="ts">
	import { TriangleAlert } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import { dueLabel, plural } from '$lib/client/format';
	import { now } from '$lib/client/now.svelte';
	import { dueWithin } from '$lib/client/views/today';
	import { dueState } from '$lib/modules/tasks/domain/deadline';
	import type { Task } from '$lib/modules/tasks/domain/task';
	import Avatar from '$lib/ui/atoms/Avatar.svelte';
	import { riskOf } from '../tasks/risk';
	import ProjectTag from './ProjectTag.svelte';

	let { tasks }: { tasks: Task[] } = $props();
	const { app, overlays } = useApp();
	const due = $derived(
		dueWithin(tasks, now.today).map((task) => ({ task, risk: riskOf(app, task) }))
	);
	const atRisk = $derived(due.filter((d) => d.risk).length);
	const tones = {
		overdue: 'text-danger-text',
		today: 'text-warn-text',
		soon: 'text-warn-text',
		later: 'text-ink-3'
	};
</script>

<section aria-labelledby="week-deadlines" class="flex flex-col gap-3">
	<header class="flex items-baseline gap-3">
		<h2 id="week-deadlines" class="text-lg font-semibold tracking-tight">
			Échéances des 7 prochains jours
		</h2>
		{#if atRisk}<span class="text-sm font-medium text-danger-text"
				>{plural(atRisk, 'à surveiller', 'à surveiller')}</span
			>{:else if due.length}<span class="text-sm text-ink-3">rien d’inquiétant</span>{/if}
	</header>
	{#if due.length}
		<ul class="flex flex-col">
			{#each due as { task, risk } (task.id)}
				{@const assignee = app.users.get(task.assigneeId)}
				{@const state = dueState(task.dueDate, now.today) ?? 'later'}
				<li>
					<button
						onclick={() => overlays.openTask(task.id)}
						class="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 py-1.5 text-left hover:bg-hover"
					>
						<span class={['w-28 shrink-0 text-sm font-semibold', tones[state]]}
							>{dueLabel(task.dueDate!, now.today)}</span
						>
						<span class="min-w-0 flex-1">
							<span class="block truncate text-base">{task.title}</span>
							<span class="flex flex-wrap items-center gap-x-3 gap-y-0.5">
								<ProjectTag project={app.projects.get(task.projectId)} />
								{#if risk}
									<span
										class={[
											'flex items-center gap-1 text-sm font-medium',
											risk.tone === 'danger' ? 'text-danger-text' : 'text-warn-text'
										]}><TriangleAlert size={13} class="shrink-0" />{risk.text}</span
									>
								{/if}
							</span>
						</span>
						{#if assignee}<Avatar name={assignee.name} color={assignee.color} size="sm" />{/if}
					</button>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="text-base text-ink-3">Aucune échéance d’ici une semaine, dans aucun projet.</p>
	{/if}
</section>
