<script lang="ts">
	import { Link2, Sparkles, Unlink } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import { definitionOfDone } from '$lib/client/views/framing';
	import { storyRef, storySentence } from '$lib/modules/framing/domain/framing';
	import type { Task } from '$lib/modules/tasks/domain/task';
	import Button from '$lib/ui/atoms/Button.svelte';
	import IconButton from '$lib/ui/atoms/IconButton.svelte';
	import CriteriaList from '$lib/ui/molecules/CriteriaList.svelte';
	import Menu from '$lib/ui/molecules/Menu.svelte';
	import { attachOptions, framingTrail } from './attach';

	let { task }: { task: Task } = $props();
	const { app, actions } = useApp();

	const project = $derived(app.projects.get(task.projectId));
	const trail = $derived(framingTrail(app, task));
	const persona = $derived(app.stakeholders.get(trail.story?.personaId));
	const options = $derived(attachOptions(app, task.projectId));
	const base = $derived(project ? `/p/${project.slug}/cadrage/fonctionnel#stories` : '');
	const done = $derived(project ? definitionOfDone(project) : []);
	// A loose feature is offered a place in the spec; other kinds are never asked.
	const loose = $derived(
		task.kind === 'feature' && !trail.epic && !trail.story && !task.outsideProduct
	);
	const attachItems = $derived(
		options.map((o) => ({
			label: o.label,
			run: () =>
				actions.tasks.update(task.id, o.kind === 'story' ? { storyId: o.id } : { epicId: o.id })
		}))
	);
</script>

{#if trail.story || trail.epic}
	<div class="mt-5 flex flex-col gap-2 rounded-xl border border-line bg-surface-2 px-4 py-3">
		<div class="flex items-start gap-2">
			<p class="flex min-w-0 flex-1 flex-wrap items-center gap-1 text-sm text-ink-3">
				{#if trail.initiative}<span>{trail.initiative.title}</span><span aria-hidden="true">›</span
					>{/if}
				{#if trail.epic}<a href={base} class="font-medium text-accent-text hover:underline"
						>{trail.epic.title}</a
					>{/if}
				{#if trail.story}{#if trail.epic}<span aria-hidden="true">›</span>{/if}<span
						class="font-mono">{storyRef(trail.story)}</span
					>{/if}
			</p>
			<IconButton
				icon={Unlink}
				size="sm"
				label="Détacher du cahier des charges"
				onclick={() => actions.tasks.update(task.id, { storyId: null, epicId: null })}
			/>
		</div>
		{#if trail.story}
			<p class="text-base">{storySentence(trail.story, persona?.name.toLowerCase() ?? null)}</p>
			{#if trail.story.criteria.length}
				<p class="text-xs font-semibold tracking-wide text-ink-3 uppercase">
					Critères d’acceptation · {task.status === 'review'
						? 'coche ce que tu as vérifié'
						: 'le relecteur les coche'}
				</p>
				<CriteriaList
					tickOnly
					criteria={trail.story.criteria}
					onchange={(criteria) => actions.framing.setCriteria(trail.story!.id, criteria)}
				/>
			{:else}
				<a href={base} class="text-sm text-warn-text hover:underline"
					>Pas encore de critère d’acceptation : les écrire</a
				>
			{/if}
		{:else if options.some((o) => o.kind === 'story')}
			<Menu
				label="Choisir la story"
				items={attachItems.filter((_, i) => options[i].kind === 'story')}
			>
				{#snippet trigger({ props })}<Button size="sm" icon={Link2} {...props}
						>Choisir sa story</Button
					>{/snippet}
			</Menu>
		{/if}
	</div>
{:else if loose}
	<div class="mt-5 flex flex-wrap items-center gap-2 text-sm text-ink-3">
		<span>Pas rattachée au cahier des charges.</span>
		{#if options.length}
			<Menu label="Rattacher à…" items={attachItems}>
				{#snippet trigger({ props })}<Button size="sm" icon={Link2} {...props}>Rattacher à…</Button
					>{/snippet}
			</Menu>
		{/if}
		<Button size="sm" icon={Sparkles} onclick={() => actions.framing.storyFromTask(task.id)}
			>En faire une story</Button
		>
	</div>
{/if}

{#if done.length && (task.status === 'doing' || task.status === 'review')}
	<details class="mt-4 rounded-xl border border-line px-4 py-2">
		<summary class="cursor-pointer text-sm font-medium text-ink-2">Fini, c’est quand…</summary>
		<ul class="mt-2 mb-1 flex list-disc flex-col gap-0.5 pl-5 text-sm text-ink-2">
			{#each done as line, i (i)}<li>{line}</li>{/each}
		</ul>
	</details>
{/if}
