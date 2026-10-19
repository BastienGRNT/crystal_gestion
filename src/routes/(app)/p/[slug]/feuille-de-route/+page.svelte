<script lang="ts">
	import { Compass, LayoutTemplate, Plus } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import { now } from '$lib/client/now.svelte';
	import type { Milestone } from '$lib/modules/roadmap/domain/milestone';
	import { currentProject } from '$lib/connected/projects/current.svelte';
	import CapCard from '$lib/connected/roadmap/CapCard.svelte';
	import CloseStepDialog from '$lib/connected/roadmap/CloseStepDialog.svelte';
	import DecisionLog from '$lib/connected/roadmap/DecisionLog.svelte';
	import Hypotheses from '$lib/connected/roadmap/Hypotheses.svelte';
	import { roadmapOf } from '$lib/connected/roadmap/roadmap-of';
	import StepCard from '$lib/connected/roadmap/StepCard.svelte';
	import StepDialog from '$lib/connected/roadmap/StepDialog.svelte';
	import { timelineStep } from '$lib/connected/roadmap/step-text';
	import TemplateDialog from '$lib/connected/roadmap/TemplateDialog.svelte';
	import Button from '$lib/ui/atoms/Button.svelte';
	import EmptyState from '$lib/ui/molecules/EmptyState.svelte';
	import PageHeader from '$lib/ui/organisms/PageHeader.svelte';
	import StepTimeline from '$lib/ui/organisms/StepTimeline.svelte';

	const { app } = useApp();
	const project = $derived(currentProject(app));
	const roadmap = $derived(project ? roadmapOf(app, project.id, now.today, now.value) : null);

	let editing = $state<{ step: Milestone | null } | null>(null);
	let closing = $state<Milestone | null>(null);
	let templates = $state(false);

	const stepOpen = {
		get: () => editing !== null,
		set: (open: boolean) => void (open || (editing = null))
	};
	const closeOpen = {
		get: () => closing !== null,
		set: (open: boolean) => void (open || (closing = null))
	};
</script>

<svelte:head><title>Feuille de route · {project?.name ?? ''} · Crystal</title></svelte:head>

{#if project && roadmap}
	<PageHeader
		title="Feuille de route"
		subtitle="Pourquoi on fait ce projet, les étapes jusqu’au bout et ce qu’on a décidé. L’avancement et les dates prévues se calculent tout seuls."
	>
		{#snippet actions()}
			<Button variant="primary" icon={Plus} onclick={() => (editing = { step: null })}
				>Ajouter une étape</Button
			>
		{/snippet}
	</PageHeader>

	<div class="mx-auto flex max-w-[1240px] flex-col gap-8 px-4 pb-12 sm:px-8">
		<CapCard {project} />

		<div class="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
			<div class="flex flex-col gap-4">
				{#if roadmap.steps.length}
					<div class="rounded-2xl border border-line bg-surface p-3 shadow-card">
						<StepTimeline
							steps={roadmap.steps.map((s) =>
								timelineStep(s, roadmap.forecasts.get(s.id), s.id === roadmap.current?.id)
							)}
						/>
					</div>
					{#each roadmap.steps as step, i (step.id)}
						<StepCard
							{step}
							number={i + 1}
							forecast={roadmap.forecasts.get(step.id)}
							current={step.id === roadmap.current?.id}
							onedit={() => (editing = { step })}
							onclose={() => (closing = step)}
						/>
					{/each}
				{:else}
					<EmptyState
						icon={Compass}
						title="Pas encore d’étapes"
						text="Découpe le projet en quelques livrables datés. L’avancement, le retard et le bilan se calculeront tout seuls, depuis le tableau."
					>
						<Button variant="primary" icon={LayoutTemplate} onclick={() => (templates = true)}
							>Partir d’un modèle</Button
						>
						<Button icon={Plus} onclick={() => (editing = { step: null })}>Ajouter une étape</Button
						>
					</EmptyState>
				{/if}
			</div>

			<div class="flex flex-col gap-10">
				<Hypotheses {project} />
				<DecisionLog {project} />
			</div>
		</div>
	</div>

	<StepDialog bind:open={stepOpen.get, stepOpen.set} projectId={project.id} step={editing?.step} />
	{#if closing}<CloseStepDialog bind:open={closeOpen.get, closeOpen.set} step={closing} />{/if}
	<TemplateDialog bind:open={templates} {project} />
{/if}
