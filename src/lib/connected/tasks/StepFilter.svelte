<script lang="ts">
	import { Compass } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import { projectMilestones } from '$lib/client/views/roadmap';
	import FilterMenu from '$lib/ui/molecules/FilterMenu.svelte';
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
	<FilterMenu
		label="Étape affichée"
		text={label}
		icon={Compass}
		active={scope !== 'all'}
		items={[
			{
				label: 'Étape en cours',
				checked: scope === 'current',
				run: () => stepFilter.set(projectId, 'current')
			},
			{
				label: 'Toutes les étapes',
				checked: scope === 'all',
				run: () => stepFilter.set(projectId, 'all')
			},
			'separator',
			...steps.map((step) => ({
				label: step.title,
				checked: scope === step.id,
				run: () => stepFilter.set(projectId, step.id)
			}))
		]}
	/>
{/if}
