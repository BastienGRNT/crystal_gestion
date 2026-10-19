<script lang="ts">
	import { ArrowUpRight, Siren, Wrench } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import { firstName, relativeTime } from '$lib/client/format';
	import { now } from '$lib/client/now.svelte';
	import { blockingBugs } from '$lib/client/views/today';
	import type { Task } from '$lib/modules/tasks/domain/task';
	import Button from '$lib/ui/atoms/Button.svelte';
	import ProjectTag from './ProjectTag.svelte';

	let { tasks }: { tasks: Task[] } = $props();
	const { app, actions, overlays } = useApp();
	const bugs = $derived(blockingBugs(tasks));

	const nameOf = (id: string) => firstName(app.users.get(id)?.name ?? 'quelqu’un');
	const reporter = (bug: Task) => bug.reportedBy ?? nameOf(bug.createdBy);
	/** Nobody on it is the alarm; someone on it is the reassurance. */
	function holder(bug: Task): string {
		if (!bug.assigneeId) return 'personne dessus';
		const who = bug.assigneeId === app.meId ? 'toi' : nameOf(bug.assigneeId);
		if (bug.status === 'review') return `en relecture (${who})`;
		return bug.status === 'doing' ? `${who} dessus` : `pour ${who}, pas commencé`;
	}
	const canTake = (bug: Task) => !bug.assigneeId || bug.status === 'todo';
	const take = (bug: Task) =>
		actions.tasks.update(bug.id, { status: 'doing', assigneeId: app.meId });
</script>

{#if bugs.length}
	<section
		aria-labelledby="blocking-bugs"
		class="flex flex-col gap-3 rounded-2xl border border-danger/40 bg-danger-soft p-4"
	>
		<h2 id="blocking-bugs" class="flex items-center gap-2 text-md font-semibold text-danger-text">
			<Siren size={18} aria-hidden="true" />
			{bugs.length > 1 ? `${bugs.length} bugs bloquants` : 'Un bug bloquant'} : ça passe avant tout
		</h2>
		<ul class="flex flex-col gap-2">
			{#each bugs as bug (bug.id)}
				<li
					class="flex flex-col gap-2 rounded-xl bg-surface px-4 py-3 shadow-card sm:flex-row sm:items-center"
				>
					<button
						class="min-h-10 min-w-0 flex-1 text-left"
						onclick={() => overlays.openTask(bug.id)}
					>
						<span class="block text-base font-semibold hover:underline"
							><span class="text-danger-text">Bug bloquant #{bug.number}</span> · {bug.title}</span
						>
						<span class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-3">
							<ProjectTag project={app.projects.get(bug.projectId)} />
							<span>· signalé par {reporter(bug)}</span>
							<span>· {relativeTime(bug.createdAt, now.value)}</span>
							<span class={bug.assigneeId ? '' : 'font-semibold text-danger-text'}
								>· {holder(bug)}</span
							>
						</span>
					</button>
					<div class="flex flex-wrap gap-2">
						{#if canTake(bug)}
							<Button size="sm" variant="primary" icon={Wrench} onclick={() => take(bug)}
								>Je m’en occupe</Button
							>
						{/if}
						<Button
							size="sm"
							variant="ghost"
							icon={ArrowUpRight}
							onclick={() => overlays.openTask(bug.id)}>Voir</Button
						>
					</div>
				</li>
			{/each}
		</ul>
	</section>
{/if}
