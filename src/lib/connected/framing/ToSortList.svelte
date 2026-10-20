<script lang="ts">
	import { Link2, Sparkles } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import { toSort } from '$lib/client/views/framing';
	import type { Project } from '$lib/modules/projects/domain/project';
	import Button from '$lib/ui/atoms/Button.svelte';
	import Menu from '$lib/ui/molecules/Menu.svelte';
	import { attachOptions } from './attach';

	let { project }: { project: Project } = $props();
	const { app, actions, overlays } = useApp();

	const loose = $derived(
		toSort(app.tasks.all.filter((t) => t.projectId === project.id)).sort(
			(a, b) => a.number - b.number
		)
	);
	const options = $derived(attachOptions(app, project.id));
</script>

{#if loose.length}
	<ul
		class="flex flex-col divide-y divide-line rounded-2xl border border-line bg-surface shadow-card"
	>
		{#each loose as task (task.id)}
			<li class="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2.5">
				<button
					class="min-w-0 flex-1 basis-56 text-left text-base hover:text-accent-text"
					onclick={() => overlays.openTask(task.id)}
					><span class="font-mono text-sm text-ink-3">#{task.number}</span> {task.title}</button
				>
				<div class="flex flex-wrap gap-1.5">
					{#if options.length}
						<Menu
							label="Rattacher à…"
							items={options.map((o) => ({
								label: o.label,
								run: () =>
									actions.tasks.update(
										task.id,
										o.kind === 'story' ? { storyId: o.id } : { epicId: o.id }
									)
							}))}
						>
							{#snippet trigger({ props })}<Button size="sm" icon={Link2} {...props}
									>Rattacher à…</Button
								>{/snippet}
						</Menu>
					{/if}
					<Button
						size="sm"
						variant="primary"
						icon={Sparkles}
						onclick={() => actions.framing.storyFromTask(task.id)}>En faire une story</Button
					>
					<Button
						size="sm"
						variant="ghost"
						onclick={() => actions.tasks.update(task.id, { outsideProduct: true })}
						>Pas du produit</Button
					>
				</div>
			</li>
		{/each}
	</ul>
{:else}
	<p class="text-sm text-ink-3">
		Rien à ranger : chaque fonctionnalité du tableau est rattachée à une epic ou à une story. Pour
		en rattacher une en la créant, écris <code class="font-mono">^epic</code> ou
		<code class="font-mono">^us-7</code> dans son titre.
	</p>
{/if}
