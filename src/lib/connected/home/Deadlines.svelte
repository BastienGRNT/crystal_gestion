<script lang="ts">
	import { Flag } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import { dueLabel } from '$lib/client/format';
	import { now } from '$lib/client/now.svelte';
	import { addDays, daysBetween } from '$lib/modules/kernel/domain/dates';
	import { dueState } from '$lib/modules/tasks/domain/deadline';
	import { isOpen } from '$lib/modules/tasks/domain/task';
	import type { Project } from '$lib/modules/projects/domain/project';
	import Avatar from '$lib/ui/atoms/Avatar.svelte';
	import { projectTasks } from '../projects/current.svelte';

	let { project }: { project: Project } = $props();
	const { app, overlays } = useApp();
	const horizon = $derived(addDays(now.today, 14));
	const due = $derived(
		projectTasks(app, project.id)
			.filter((t) => isOpen(t) && t.dueDate && t.dueDate <= horizon)
			.sort((a, b) => a.dueDate!.localeCompare(b.dueDate!))
	);
	const delivery = $derived(project.deadline ? daysBetween(now.today, project.deadline) : null);
	const tones = {
		overdue: 'text-danger-text',
		today: 'text-warn-text',
		soon: 'text-warn-text',
		later: 'text-ink-3'
	};
</script>

<section aria-labelledby="deadlines" class="flex flex-col gap-3">
	<h2 id="deadlines" class="text-lg font-semibold tracking-tight">Échéances</h2>
	{#if delivery !== null}
		<p
			class={[
				'flex items-center gap-2 rounded-xl px-4 py-3 text-base font-semibold',
				delivery < 0 ? 'bg-danger-soft text-danger-text' : 'bg-sunken text-ink'
			]}
		>
			<Flag size={17} />
			{delivery < 0
				? `Livraison dépassée de ${-delivery} j`
				: delivery === 0
					? 'Livraison aujourd’hui'
					: `Livraison dans ${delivery} jour${delivery > 1 ? 's' : ''}`}
		</p>
	{/if}
	{#if due.length}
		<ul class="flex flex-col">
			{#each due as task (task.id)}
				{@const assignee = app.users.get(task.assigneeId)}
				{@const state = dueState(task.dueDate, now.today) ?? 'later'}
				<li>
					<button
						onclick={() => overlays.openTask(task.id)}
						class="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left hover:bg-hover"
					>
						<span class={['w-28 shrink-0 text-sm font-semibold', tones[state]]}
							>{dueLabel(task.dueDate!, now.today)}</span
						>
						<span class="min-w-0 flex-1 truncate text-base">{task.title}</span>
						{#if assignee}<Avatar name={assignee.name} color={assignee.color} size="sm" />{/if}
					</button>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="text-base text-ink-3">Aucune échéance dans les deux semaines.</p>
	{/if}
</section>
