<script lang="ts">
	import { useApp } from '$lib/client/context';
	import { tint } from '$lib/client/labels';
	import { activeComponents } from '$lib/modules/tasks/domain/component';
	import type { Project } from '$lib/modules/projects/domain/project';
	import Select from '$lib/ui/atoms/Select.svelte';
	import EditableText from '$lib/ui/molecules/EditableText.svelte';
	import InlineAdd from '$lib/ui/molecules/InlineAdd.svelte';

	let { project }: { project: Project } = $props();
	const { app, actions } = useApp();

	const modules = $derived(
		activeComponents(app.components.all.filter((c) => c.projectId === project.id))
	);
	const tops = $derived(modules.filter((m) => !m.parentId));
	const partsOf = (id: string) => modules.filter((m) => m.parentId === id);
	const epicsOf = (id: string) =>
		app.epics.all.filter((e) => e.componentId === id && !e.later).length;
</script>

{#snippet line(module: (typeof modules)[number], nested: boolean)}
	{@const hasParts = partsOf(module.id).length > 0}
	<li class={['flex flex-col gap-0.5 py-2', nested && 'pl-6']}>
		<div class="flex flex-wrap items-center gap-2">
			<span class="size-2.5 shrink-0 rounded-[3px]" style:background-color={tint(module.color)}
			></span>
			<EditableText
				label="Nom du module"
				value={module.name}
				maxlength={30}
				class={nested ? 'text-base' : 'font-semibold'}
				onsave={(name) => actions.tasks.updateComponent(module.id, { name })}
			/>
			<span class="text-xs text-ink-3">
				{epicsOf(module.id)} epic{epicsOf(module.id) > 1 ? 's' : ''}
			</span>
			{#if !hasParts}
				<Select
					size="sm"
					label="Fait partie de"
					value={module.parentId ?? ''}
					class="ml-auto"
					options={[
						{ value: '', label: 'Module principal' },
						...tops
							.filter((t) => t.id !== module.id)
							.map((t) => ({ value: t.id, label: `Dans ${t.name}` }))
					]}
					onchange={(parentId) =>
						actions.tasks.updateComponent(module.id, { parentId: parentId || null })}
				/>
			{/if}
		</div>
		<EditableText
			label="Ce que c’est"
			value={module.description}
			placeholder="Ce que c’est, une fois livré"
			allowEmpty
			maxlength={600}
			class="text-sm text-ink-2"
			onsave={(description) => actions.tasks.updateComponent(module.id, { description })}
		/>
	</li>
{/snippet}

<div class="flex flex-col gap-2">
	{#if modules.length}
		<ul
			class="flex flex-col divide-y divide-line rounded-2xl border border-line bg-surface px-4 shadow-card"
		>
			{#each tops as top (top.id)}
				{@render line(top, false)}
				{#each partsOf(top.id) as part (part.id)}{@render line(part, true)}{/each}
			{/each}
		</ul>
	{/if}
	<InlineAdd
		label="Ajouter un module"
		placeholder="Une grande partie du produit, ex. : Prise de rendez-vous"
		onadd={(name) => actions.tasks.addComponent(project.id, name)}
	/>
</div>
