<script lang="ts">
	import { ChevronDown, Compass } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import { projectMilestones } from '$lib/client/views/roadmap';
	import Menu from '$lib/ui/molecules/Menu.svelte';
	import { stepFilter } from './step-filter.svelte';

	let { projectId }: { projectId: string } = $props();
	const { app } = useApp();
	const steps = $derived(
		projectMilestones(app.milestones.all, projectId).filter((m) => !m.closedAt)
	);
	const scope = $derived(stepFilter.scope(app, projectId));
	const label = $derived(
		scope === 'all'
			? 'Toutes les étapes'
			: scope === 'current'
				? `Étape en cours${steps[0] ? ` : ${steps[0].title}` : ''}`
				: (app.milestones.get(scope)?.title ?? '')
	);
</script>

<!-- Only once the project has steps: without them, the board reads as before. -->
{#if steps.length}
	<Menu
		label="Étape affichée"
		placement="bottom-start"
		items={[
			{ label: 'Étape en cours', run: () => stepFilter.set(projectId, 'current') },
			{ label: 'Toutes les étapes', run: () => stepFilter.set(projectId, 'all') },
			'separator',
			...steps.map((step) => ({ label: step.title, run: () => stepFilter.set(projectId, step.id) }))
		]}
	>
		{#snippet trigger({ props })}
			<button
				{...props}
				class="inline-flex h-11 max-w-full items-center gap-2 rounded-xl border border-line-strong/70 bg-surface px-3.5 text-base font-medium shadow-card hover:border-line-strong"
			>
				<Compass size={17} class="shrink-0 text-accent-text" aria-hidden="true" />
				<span class="truncate">{label}</span>
				<ChevronDown size={16} class="shrink-0 text-ink-3" aria-hidden="true" />
			</button>
		{/snippet}
	</Menu>
{/if}
