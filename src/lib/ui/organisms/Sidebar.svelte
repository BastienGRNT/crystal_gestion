<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Plus, Search } from '@lucide/svelte';
	import NavLink from '../molecules/NavLink.svelte';
	import type { MenuLink, NavEntry, SidebarFeature } from '../types';
	import ProjectSwitcher from './ProjectSwitcher.svelte';
	import SidebarFeatures from './SidebarFeatures.svelte';

	interface Props {
		project: { slug: string; name: string };
		projects: { slug: string; name: string }[];
		projectLinks: MenuLink[];
		entries: NavEntry[];
		features: SidebarFeature[];
		active: string;
		oncreate: () => void;
		onfeature: () => void;
		onsearch: () => void;
		timer?: Snippet;
		footer: Snippet;
	}

	let {
		project,
		projects,
		projectLinks,
		entries,
		features,
		active,
		oncreate,
		onfeature,
		onsearch,
		timer,
		footer
	}: Props = $props();
</script>

<aside class="flex h-full w-[240px] shrink-0 flex-col bg-sidebar py-2.5 pr-2.5 pl-3">
	<ProjectSwitcher current={project} {projects} links={projectLinks} />
	<div class="mt-1.5 mb-3 flex gap-1.5">
		<button
			onclick={oncreate}
			title="Nouveau : tâche, bug, feature, idée, décision (C)"
			class="flex h-9 flex-1 items-center gap-2 rounded-lg bg-accent px-3 text-sm font-medium text-accent-ink shadow-sm transition hover:brightness-110"
		>
			<Plus size={16} strokeWidth={2.2} /><span class="flex-1 text-left">Nouveau</span>
			<span class="font-mono text-2xs opacity-75">C</span>
		</button>
		<button
			onclick={onsearch}
			title="Rechercher (⌘K)"
			aria-label="Rechercher"
			class="flex size-9 items-center justify-center rounded-lg border border-line bg-panel text-ink-2 transition hover:border-line-strong hover:text-ink"
		>
			<Search size={16} />
		</button>
	</div>
	<nav class="flex flex-col gap-0.5" aria-label="Navigation principale">
		{#each entries as entry (entry.key)}
			<NavLink {...entry} active={active === entry.key} />
		{/each}
	</nav>
	<SidebarFeatures {features} oncreate={onfeature} />
	<div class="mt-auto flex flex-col gap-2 pt-3">
		{@render timer?.()}
		{@render footer()}
	</div>
</aside>
