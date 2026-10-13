<script lang="ts">
	import { Check, ChevronsUpDown, FolderPlus, LayoutGrid } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import { tint } from '$lib/client/labels';
	import { activeProjects } from '$lib/client/views/workspace';
	import type { Project } from '$lib/modules/projects/domain/project';
	import Popover from '$lib/ui/molecules/Popover.svelte';

	let { project }: { project: Project | undefined } = $props();
	const { app, overlays } = useApp();
	const projects = $derived(activeProjects(app.projects.all));
	let open = $state(false);
	let anchor = $state<HTMLElement>();

	/** Something waits for me there: an unread notification or message. */
	function waiting(projectId: string) {
		const notes = app.notifications.all.some((n) => n.projectId === projectId && !n.readAt);
		const channels = new Set(
			app.channels.all.filter((c) => c.projectId === projectId).map((c) => c.id)
		);
		return notes || app.channelStates.all.some((s) => channels.has(s.channelId) && s.unread > 0);
	}
</script>

<button
	bind:this={anchor}
	onclick={() => (open = !open)}
	class="flex h-12 w-full items-center gap-3 rounded-xl border border-line bg-surface px-3 text-left shadow-card transition-colors hover:border-line-strong"
	aria-label="Changer de projet"
>
	{#if project}
		<span class="size-4 shrink-0 rounded-md" style:background-color={tint(project.color)}></span>
		<span class="min-w-0 flex-1 truncate text-md font-semibold">{project.name}</span>
	{:else}
		<LayoutGrid size={18} class="text-ink-3" />
		<span class="min-w-0 flex-1 truncate text-md font-semibold">Mes projets</span>
	{/if}
	<ChevronsUpDown size={16} class="shrink-0 text-ink-3" aria-hidden="true" />
</button>

<Popover bind:open {anchor} label="Projets" class="w-[min(86vw,288px)]">
	<p class="px-3 pt-2 pb-1 text-xs font-semibold tracking-wide text-ink-3 uppercase">Tes projets</p>
	{#each projects as p (p.id)}
		<a
			href="/p/{p.slug}"
			onclick={() => (open = false)}
			class="flex h-11 items-center gap-3 rounded-lg px-3 text-base hover:bg-hover"
		>
			<span class="size-3.5 shrink-0 rounded-[4px]" style:background-color={tint(p.color)}></span>
			<span class="min-w-0 flex-1 truncate">{p.name}</span>
			{#if waiting(p.id) && p.id !== project?.id}<span
					class="size-2 rounded-full bg-accent"
					aria-label="Du nouveau"
				></span>{/if}
			{#if p.id === project?.id}<Check size={16} class="text-accent" />{/if}
		</a>
	{/each}
	<div class="my-1 h-px bg-line"></div>
	<a
		href="/projets"
		onclick={() => (open = false)}
		class="flex h-11 items-center gap-3 rounded-lg px-3 text-base hover:bg-hover"
	>
		<LayoutGrid size={17} class="text-ink-3" /> Tous mes projets
	</a>
	<button
		onclick={() => ((open = false), (overlays.create = { kind: 'project' }))}
		class="flex h-11 w-full items-center gap-3 rounded-lg px-3 text-base hover:bg-hover"
	>
		<FolderPlus size={17} class="text-ink-3" /> Nouveau projet
	</button>
</Popover>
