<script lang="ts">
	import { Bug, Compass, Flag } from '@lucide/svelte';
	import { plural } from '$lib/client/format';
	import { tint } from '$lib/client/labels';
	import { now } from '$lib/client/now.svelte';
	import { useApp } from '$lib/client/context';
	import { projectGlances } from '$lib/client/views/today';
	import type { Project } from '$lib/modules/projects/domain/project';
	import type { Task } from '$lib/modules/tasks/domain/task';

	let { projects, tasks }: { projects: Project[]; tasks: Task[] } = $props();
	const { app } = useApp();
	const glances = $derived(projectGlances(projects, tasks, app.milestones.all, now.today));

	function delivery(days: number) {
		if (days < 0) return { text: `Livraison dépassée de ${-days} j`, tone: 'text-danger-text' };
		if (days === 0) return { text: 'Livraison aujourd’hui', tone: 'text-warn-text' };
		return { text: `Livraison dans ${days} j`, tone: days <= 7 ? 'text-warn-text' : 'text-ink-3' };
	}
</script>

<section aria-labelledby="my-projects" class="flex flex-col gap-3">
	<h2 id="my-projects" class="text-lg font-semibold tracking-tight">Mes projets</h2>
	<ul class="flex flex-col gap-2">
		{#each glances as { project, step, openBugs, deliveryIn } (project.id)}
			<li>
				<a
					href="/p/{project.slug}"
					class="flex gap-3 rounded-xl border border-line bg-surface p-3 shadow-card transition-colors hover:border-line-strong hover:bg-surface-2"
				>
					<span
						class="mt-1 size-3.5 shrink-0 rounded-[4px]"
						style:background-color={tint(project.color)}
						aria-hidden="true"
					></span>
					<span class="flex min-w-0 flex-1 flex-col gap-0.5">
						<span class="truncate text-base font-semibold">{project.name}</span>
						<span class="flex items-center gap-1.5 text-sm text-ink-2">
							<Compass size={13} class="shrink-0 text-ink-3" aria-hidden="true" />
							<span class="truncate">{step ? step.title : 'Pas d’étape en cours'}</span>
						</span>
						<span class="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm">
							<span
								class={[
									'flex items-center gap-1',
									openBugs ? 'font-medium text-danger-text' : 'text-ink-3'
								]}
							>
								<Bug size={13} aria-hidden="true" />{openBugs
									? plural(openBugs, 'bug ouvert', 'bugs ouverts')
									: 'aucun bug'}
							</span>
							{#if deliveryIn !== null}
								{@const d = delivery(deliveryIn)}
								<span class={['flex items-center gap-1 font-medium', d.tone]}
									><Flag size={13} aria-hidden="true" />{d.text}</span
								>
							{/if}
						</span>
					</span>
				</a>
			</li>
		{/each}
	</ul>
</section>
