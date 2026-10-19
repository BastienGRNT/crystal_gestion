<script lang="ts">
	import { Check, FlaskConical, Trash2, X } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import { MAX_OPEN_HYPOTHESES } from '$lib/modules/roadmap/domain/hypothesis';
	import type { Project } from '$lib/modules/projects/domain/project';
	import Button from '$lib/ui/atoms/Button.svelte';
	import IconButton from '$lib/ui/atoms/IconButton.svelte';
	import InlineAdd from '$lib/ui/molecules/InlineAdd.svelte';

	let { project }: { project: Project } = $props();
	const { app, actions, overlays } = useApp();

	const all = $derived(
		app.hypotheses.all
			.filter((h) => h.projectId === project.id)
			.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
	);
	const open = $derived(all.filter((h) => h.verdict === 'open'));
	const judged = $derived(all.filter((h) => h.verdict !== 'open'));
	const STATUS = {
		todo: 'à faire',
		doing: 'en cours',
		review: 'en revue',
		done: 'faite',
		idea: 'en piste'
	};
</script>

<section aria-labelledby="hypotheses" class="flex flex-col gap-3">
	<header>
		<h2 id="hypotheses" class="flex items-center gap-2 text-lg font-semibold tracking-tight">
			<FlaskConical size={18} class="text-plan-text" aria-hidden="true" />À vérifier
		</h2>
		<p class="text-sm text-ink-3">
			Ce sur quoi le projet parie sans l’avoir vérifié. « Vérifier » en fait une tâche ; sa fin
			tranche.
		</p>
	</header>

	{#if open.length}
		<ul class="flex flex-col gap-2">
			{#each open as h (h.id)}
				{@const task = app.tasks.get(h.taskId)}
				<li
					class="flex flex-col gap-2 rounded-xl border border-line bg-surface px-3.5 py-3 shadow-card"
				>
					<div class="flex items-start gap-2">
						<p class="min-w-0 flex-1 text-base">{h.text}</p>
						<IconButton
							icon={Trash2}
							label="Retirer l’hypothèse"
							size="sm"
							onclick={() => actions.roadmap.removeHypothesis(h.id)}
						/>
					</div>
					<div class="flex flex-wrap items-center gap-2">
						{#if task}
							<button
								class="text-sm text-ink-2 hover:text-accent-text hover:underline"
								onclick={() => overlays.openTask(task.id)}
								>Tâche #{task.number} · {STATUS[task.status]}</button
							>
							{#if task.status === 'done'}
								<span class="text-sm text-ink-3">· Alors ?</span>
								<Button size="sm" icon={Check} onclick={() => actions.roadmap.judge(h.id, 'true')}
									>Vrai</Button
								>
								<Button size="sm" icon={X} onclick={() => actions.roadmap.judge(h.id, 'false')}
									>Faux</Button
								>
							{/if}
						{:else}
							<Button size="sm" onclick={() => actions.roadmap.verify(h.id)}>Vérifier</Button>
						{/if}
					</div>
				</li>
			{/each}
		</ul>
	{/if}

	{#if open.length < MAX_OPEN_HYPOTHESES}
		<InlineAdd
			label="Ajouter une hypothèse"
			placeholder="Ex. : les kinés paieront 29 € par mois"
			onadd={(text) => void actions.roadmap.addHypothesis(project.id, text)}
		/>
	{:else}
		<p class="text-sm text-ink-3">Trois à la fois : tranche-en une avant d’en ajouter.</p>
	{/if}

	{#if judged.length}
		<ul class="flex flex-col gap-1">
			{#each judged as h (h.id)}
				<li class="flex items-start gap-2 text-sm text-ink-3">
					{#if h.verdict === 'true'}<Check size={15} class="mt-0.5 shrink-0 text-ok-text" />
					{:else}<X size={15} class="mt-0.5 shrink-0 text-danger-text" />{/if}
					<span class={h.verdict === 'false' ? 'line-through' : ''}>{h.text}</span>
				</li>
			{/each}
		</ul>
	{/if}
</section>
