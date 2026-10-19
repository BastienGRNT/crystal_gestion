<script lang="ts">
	import { Flag } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import { currentStepOf } from '$lib/client/views/roadmap';
	import type { Project } from '$lib/modules/projects/domain/project';

	let { project }: { project: Project } = $props();
	const { app, actions } = useApp();
	// With no goal yet, the step under way says what "done" means: a ready-made suggestion.
	const doneWhen = $derived(currentStepOf(app.milestones.all, project.id)?.doneWhen ?? '');
	let editing = $state(false);
	let text = $state('');

	function save() {
		editing = false;
		if (text.trim() !== project.weekGoal) actions.projects.update(project.id, { weekGoal: text });
	}
</script>

<!-- One sentence for the week: the cheapest way to agree on where you are going. -->
<div class="flex items-center gap-3 rounded-2xl border border-accent/25 bg-accent-soft px-4 py-3">
	<Flag size={18} class="shrink-0 text-accent-text" aria-hidden="true" />
	{#if editing}
		<!-- svelte-ignore a11y_autofocus (opened on purpose by the person) -->
		<input
			bind:value={text}
			autofocus
			maxlength={160}
			aria-label="Objectif de la semaine"
			placeholder={doneWhen
				? `Ex. : ${doneWhen}`
				: 'Ex. : mettre le paiement en ligne avant vendredi'}
			class="h-10 min-w-0 flex-1 rounded-lg bg-surface px-3 text-base outline-none focus:ring-4 focus:ring-accent/20"
			onkeydown={(e) => {
				if (e.key === 'Enter') e.currentTarget.blur();
				if (e.key === 'Escape') editing = false;
			}}
			onblur={save}
		/>
	{:else}
		<button
			class="min-w-0 flex-1 text-left text-base"
			onclick={() => ((text = project.weekGoal), (editing = true))}
		>
			{#if project.weekGoal}
				<span class="font-semibold text-accent-text">Cette semaine :</span> {project.weekGoal}
			{:else}
				<span class="text-accent-text"
					>Fixe l’objectif de la semaine en une phrase : chacun sait où on va.</span
				>
				{#if doneWhen}<span class="block text-sm text-ink-2"
						>L’étape en cours est finie quand : {doneWhen}</span
					>{/if}
			{/if}
		</button>
	{/if}
</div>
