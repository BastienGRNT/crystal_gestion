<script lang="ts">
	import { Puzzle } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { useApp } from '$lib/client/context';
	import { tint } from '$lib/client/labels';
	import { activeComponents } from '$lib/modules/tasks/domain/component';
	import type { Project } from '$lib/modules/projects/domain/project';
	import EditableText from '$lib/ui/molecules/EditableText.svelte';
	import InlineAdd from '$lib/ui/molecules/InlineAdd.svelte';
	import { workFilter } from '../tasks/kind-filter.svelte';

	let { project }: { project: Project } = $props();
	const { app, actions } = useApp();

	const modules = $derived(
		activeComponents(app.components.all.filter((c) => c.projectId === project.id))
	);
	const tasks = $derived(app.tasks.all.filter((t) => t.projectId === project.id));
	const isOpen = (status: string) => ['todo', 'doing', 'review'].includes(status);
	/** Where each part of the product stands: what is open, its bugs, what shipped lately. */
	function health(id: string) {
		const own = tasks.filter((t) => t.componentId === id);
		const bugs = own.filter((t) => t.kind === 'bug' && isOpen(t.status));
		const monthAgo = Date.now() - 28 * 86_400_000;
		return {
			open: own.filter((t) => t.kind !== 'bug' && isOpen(t.status)).length,
			bugs: bugs.length,
			critical: bugs.filter((t) => t.critical).length,
			done: own.filter((t) => t.status === 'done' && Date.parse(t.completedAt ?? '') >= monthAgo)
				.length
		};
	}

	function showOnBoard(id: string) {
		workFilter.componentId = id;
		void goto(`/p/${project.slug}/tableau`);
	}
</script>

<section aria-labelledby="modules" class="flex flex-col gap-3">
	<div>
		<h2 id="modules" class="flex items-center gap-2 text-lg font-semibold tracking-tight">
			<Puzzle size={18} class="text-accent-text" aria-hidden="true" />Modules
		</h2>
		<p class="text-sm text-ink-3">
			Les parties du produit (site, rendez-vous, ordonnances…). Un nouveau module, c’est une ligne
			ici, pas un nouveau projet. « +rdv » dans une tâche l’y range.
		</p>
	</div>
	{#if modules.length}
		<ul
			class="flex flex-col divide-y divide-line rounded-xl border border-line bg-surface shadow-card"
		>
			{#each modules as module (module.id)}
				{@const h = health(module.id)}
				<li class="flex items-center gap-2 px-3 py-1.5">
					<span
						class="size-3 shrink-0 rounded-[4px]"
						style:background-color={tint(module.color)}
						aria-hidden="true"
					></span>
					<div class="min-w-0 flex-1">
						<EditableText
							label="Nom du module"
							value={module.name}
							maxlength={30}
							class="text-base font-medium"
							onsave={(name) => actions.tasks.updateComponent(module.id, { name })}
						/>
						<button
							class="-mt-1 block text-left text-sm text-ink-3 hover:text-accent-text"
							onclick={() => showOnBoard(module.id)}
						>
							{h.open} ouverte{h.open > 1 ? 's' : ''} ·
							<span
								class={h.critical
									? 'font-semibold text-danger-text'
									: h.bugs
										? 'text-warn-text'
										: ''}
								>{h.bugs} bug{h.bugs > 1 ? 's' : ''}{h.critical
									? ` dont ${h.critical} bloquant`
									: ''}</span
							>
							· {h.done} finie{h.done > 1 ? 's' : ''} en 4 semaines
						</button>
					</div>
					<button
						class="h-10 shrink-0 rounded-lg px-2 text-sm text-ink-3 hover:bg-hover hover:text-ink-2"
						onclick={() => actions.tasks.removeComponent(module.id)}>Retirer</button
					>
				</li>
			{/each}
		</ul>
	{/if}
	<InlineAdd
		label="Ajouter un module"
		placeholder="Nom du module, puis Entrée (ex. : Prise de RDV)"
		onadd={(name) => actions.tasks.addComponent(project.id, name)}
	/>
</section>
