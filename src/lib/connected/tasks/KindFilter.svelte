<script lang="ts">
	import { Puzzle, Shapes } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import { KINDS } from '$lib/client/labels';
	import { TASK_KINDS, type TaskKind } from '$lib/modules/tasks/domain/task';
	import FilterMenu from '$lib/ui/molecules/FilterMenu.svelte';
	import { componentOptions } from './components-of';
	import { workFilter } from './kind-filter.svelte';

	let { projectId }: { projectId: string } = $props();
	const { app } = useApp();
	const modules = $derived(componentOptions(app, projectId));
	const openBugs = $derived(
		app.tasks.all.filter(
			(t) =>
				t.projectId === projectId &&
				t.kind === 'bug' &&
				['todo', 'doing', 'review'].includes(t.status)
		).length
	);

	// A module of another project (or archived) would hide everything.
	$effect(() => {
		if (workFilter.componentId && !modules.some((m) => m.id === workFilter.componentId))
			workFilter.componentId = null;
	});

	const kindMeta = $derived(workFilter.kind ? KINDS[workFilter.kind] : null);
	const module = $derived(modules.find((m) => m.id === workFilter.componentId));
</script>

<FilterMenu
	label="Type de tâche"
	text={kindMeta ? kindMeta.plural : 'Tous les types'}
	icon={kindMeta?.icon ?? Shapes}
	active={!!kindMeta}
	items={[
		{ label: 'Tous les types', checked: !workFilter.kind, run: () => workFilter.setKind(null) },
		'separator',
		...TASK_KINDS.map((kind) => ({
			label: `${KINDS[kind].plural}${kind === 'bug' && openBugs ? ` (${openBugs} ouverts)` : ''}`,
			icon: KINDS[kind].icon,
			checked: workFilter.kind === kind,
			run: () => workFilter.setKind(kind as TaskKind)
		}))
	]}
/>

<!-- From one module on: "Voir sur le tableau" can set it, so it must always be removable. -->
{#if modules.length > 0}
	<FilterMenu
		label="Module"
		text={module ? module.name : 'Tous les modules'}
		icon={Puzzle}
		active={!!module}
		items={[
			{
				label: 'Tous les modules',
				checked: !workFilter.componentId,
				run: () => (workFilter.componentId = null)
			},
			'separator',
			...modules.map((m) => ({
				label: m.name,
				checked: workFilter.componentId === m.id,
				run: () => (workFilter.componentId = m.id)
			}))
		]}
	>
		{#snippet lead()}{#if module}<span
					class="size-2.5 shrink-0 rounded-[3px]"
					style:background-color={module.color}
				></span>{:else}<Puzzle size={15} class="shrink-0" aria-hidden="true" />{/if}{/snippet}
	</FilterMenu>
{/if}
