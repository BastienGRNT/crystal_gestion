<script lang="ts">
	import { useApp } from '$lib/client/context';
	import { KINDS } from '$lib/client/labels';
	import { TASK_KINDS, type TaskKind } from '$lib/modules/tasks/domain/task';
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

	const pill = (on: boolean) => [
		'inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-base font-medium transition-all',
		on ? 'bg-surface text-ink shadow-raise' : 'text-ink-3 hover:text-ink'
	];
</script>

<div
	class="inline-flex flex-wrap gap-0.5 rounded-xl bg-sunken p-1"
	role="radiogroup"
	aria-label="Type"
>
	<button
		type="button"
		role="radio"
		aria-checked={workFilter.kind === null}
		class={pill(workFilter.kind === null)}
		onclick={() => workFilter.setKind(null)}>Tout</button
	>
	{#each TASK_KINDS as kind (kind)}
		{@const meta = KINDS[kind]}
		<button
			type="button"
			role="radio"
			aria-checked={workFilter.kind === kind}
			title={meta.hint}
			class={pill(workFilter.kind === kind)}
			onclick={() => workFilter.setKind(workFilter.kind === kind ? null : (kind as TaskKind))}
		>
			<meta.icon
				size={15}
				class={meta.text}
				aria-hidden="true"
			/>{meta.plural}{#if kind === 'bug' && openBugs}<span
					class="rounded-full bg-danger-soft px-1.5 text-xs font-semibold text-danger-text"
					>{openBugs}</span
				>{/if}
		</button>
	{/each}
</div>

<!-- From one module on: "Voir sur le tableau" can set it, so it must always be removable. -->
{#if modules.length > 0}
	<div
		class="inline-flex flex-wrap gap-0.5 rounded-xl bg-sunken p-1"
		role="radiogroup"
		aria-label="Module"
	>
		<button
			type="button"
			role="radio"
			aria-checked={workFilter.componentId === null}
			class={pill(workFilter.componentId === null)}
			onclick={() => (workFilter.componentId = null)}>Tous les modules</button
		>
		{#each modules as module (module.id)}
			<button
				type="button"
				role="radio"
				aria-checked={workFilter.componentId === module.id}
				class={pill(workFilter.componentId === module.id)}
				onclick={() =>
					(workFilter.componentId = workFilter.componentId === module.id ? null : module.id)}
			>
				<span class="size-2.5 rounded-[3px]" style:background-color={module.color}
				></span>{module.name}
			</button>
		{/each}
	</div>
{/if}
