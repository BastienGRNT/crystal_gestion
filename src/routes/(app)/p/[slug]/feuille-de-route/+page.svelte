<script lang="ts">
	import { Compass, LayoutTemplate, Plus } from '@lucide/svelte';
	import { tick } from 'svelte';
	import { useApp } from '$lib/client/context';
	import { dnd, reflow } from '$lib/client/dnd.svelte';
	import { now } from '$lib/client/now.svelte';
	import { datedBeforePrevious, type Milestone } from '$lib/modules/roadmap/domain/milestone';
	import { positionAt } from '$lib/modules/tasks/domain/position';
	import { parseDay } from '$lib/modules/tasks/domain/quick-entry';
	import { currentProject } from '$lib/connected/projects/current.svelte';
	import CapCard from '$lib/connected/roadmap/CapCard.svelte';
	import CloseStepDialog from '$lib/connected/roadmap/CloseStepDialog.svelte';
	import DecisionLog from '$lib/connected/roadmap/DecisionLog.svelte';
	import Hypotheses from '$lib/connected/roadmap/Hypotheses.svelte';
	import Modules from '$lib/connected/roadmap/Modules.svelte';
	import { roadmapOf } from '$lib/connected/roadmap/roadmap-of';
	import StepCard from '$lib/connected/roadmap/StepCard.svelte';
	import { timelineStep } from '$lib/connected/roadmap/step-text';
	import TemplateDialog from '$lib/connected/roadmap/TemplateDialog.svelte';
	import Button from '$lib/ui/atoms/Button.svelte';
	import DropSlot from '$lib/ui/atoms/DropSlot.svelte';
	import EmptyState from '$lib/ui/molecules/EmptyState.svelte';
	import InlineAdd from '$lib/ui/molecules/InlineAdd.svelte';
	import PageHeader from '$lib/ui/organisms/PageHeader.svelte';
	import StepTimeline from '$lib/ui/organisms/StepTimeline.svelte';

	const ZONE = 'steps';
	const { app, actions } = useApp();
	const project = $derived(currentProject(app));
	const roadmap = $derived(project ? roadmapOf(app, project.id, now.today, now.value) : null);
	const closedSteps = $derived(roadmap?.steps.filter((s) => s.closedAt) ?? []);
	const openSteps = $derived(roadmap?.steps.filter((s) => !s.closedAt) ?? []);
	const rows = $derived(dnd.rows(ZONE, openSteps));

	let closing = $state<Milestone | null>(null);
	let templates = $state(false);
	let adder = $state<HTMLElement>();

	const closeOpen = {
		get: () => closing !== null,
		set: (open: boolean) => void (open || (closing = null))
	};

	/** Closed steps stay first: only the open ones move. */
	function drop(id: string, index: number) {
		const others = openSteps.filter((s) => s.id !== id).map((s) => s.position);
		actions.roadmap.moveStep(id, positionAt(others, index));
	}

	/** "Bêta privée 15/12": a date at the end becomes the step's date. */
	function addStep(text: string) {
		if (!project) return false;
		const words = text.trim().split(/\s+/);
		const date = words.length > 1 ? parseDay(words.at(-1)!, now.today) : null;
		const title = date ? words.slice(0, -1).join(' ') : text.trim();
		return actions.roadmap.createStep(project.id, { title, targetDate: date }) !== null;
	}

	async function focusAdder() {
		adder?.scrollIntoView({ block: 'center', behavior: 'smooth' });
		await tick();
		adder?.querySelector('button')?.click();
	}

	const numberOf = (step: Milestone) => (roadmap?.steps.indexOf(step) ?? 0) + 1;
</script>

<svelte:head><title>Feuille de route · {project?.name ?? ''} · Crystal</title></svelte:head>

{#if project && roadmap}
	<PageHeader
		title="Feuille de route"
		subtitle="Pourquoi on fait ce projet, les étapes jusqu’au bout et ce qu’on a décidé. Clique sur un texte pour le changer ; l’avancement et les dates prévues se calculent tout seuls."
	>
		{#snippet actions()}
			<Button icon={Plus} onclick={focusAdder}>Ajouter une étape</Button>
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
								timelineStep(s, roadmap.forecasts.get(s.id), roadmap.currentIds.has(s.id))
							)}
						/>
					</div>
					{#each closedSteps as step (step.id)}
						<StepCard
							{step}
							number={numberOf(step)}
							forecast={roadmap.forecasts.get(step.id)}
							current={false}
							outOfOrder={false}
							onclose={() => {}}
						/>
					{/each}
					<div {@attach dnd.dropzone(ZONE, drop)} class="relative flex flex-col gap-4">
						{#each rows as row (row.key)}
							<div animate:reflow {@attach row.item && dnd.draggable(row.item.id, ZONE)}>
								{#if row.item}
									{@const step = row.item}
									<StepCard
										{step}
										number={numberOf(step)}
										forecast={roadmap.forecasts.get(step.id)}
										current={roadmap.currentIds.has(step.id)}
										outOfOrder={datedBeforePrevious(roadmap.steps, step.id)}
										onclose={() => (closing = step)}
									/>
								{:else}
									<DropSlot height={dnd.active?.height ?? 0} />
								{/if}
							</div>
						{/each}
					</div>
					<div bind:this={adder}>
						<InlineAdd
							label="Ajouter une étape"
							placeholder="Nom de l’étape, puis Entrée (ex. : Bêta privée 15/12)"
							hint="Une date à la fin devient sa date. Glisse une étape par sa poignée pour la déplacer."
							onadd={addStep}
						/>
					</div>
				{:else}
					<EmptyState
						icon={Compass}
						title="Pas encore d’étapes"
						text="Découpe le projet en quelques livrables datés. L’avancement, le retard et le bilan se calculeront tout seuls, depuis le tableau."
					>
						<Button variant="primary" icon={LayoutTemplate} onclick={() => (templates = true)}
							>Partir d’un modèle</Button
						>
					</EmptyState>
					<div bind:this={adder}>
						<InlineAdd
							label="Ajouter une étape"
							placeholder="Nom de l’étape, puis Entrée (ex. : Bêta privée 15/12)"
							onadd={addStep}
						/>
					</div>
				{/if}
			</div>

			<div class="flex flex-col gap-10">
				<Modules {project} />
				<Hypotheses {project} />
				<DecisionLog {project} />
			</div>
		</div>
	</div>

	{#if closing}<CloseStepDialog bind:open={closeOpen.get, closeOpen.set} step={closing} />{/if}
	<TemplateDialog bind:open={templates} {project} />
{/if}
