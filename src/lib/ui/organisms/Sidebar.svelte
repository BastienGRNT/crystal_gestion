<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Search } from '@lucide/svelte';
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
		onfeature,
		onsearch,
		timer,
		footer
	}: Props = $props();
</script>

<aside class="flex h-full w-[264px] shrink-0 flex-col bg-sidebar px-3.5 pt-4 pb-3 text-side-ink">
	<ProjectSwitcher current={project} {projects} links={projectLinks} />
	<button
		onclick={onsearch}
		class="mt-3 mb-4 flex h-10 items-center gap-2.5 rounded-[10px] border border-side-active px-3 text-sm text-side-ink-2 transition hover:border-side-ink-3 hover:text-side-ink"
	>
		<Search size={16} /><span class="flex-1 text-left">Rechercher</span>
		<span class="text-xs text-side-ink-3">⌘K</span>
	</button>
	<nav class="flex flex-col gap-1" aria-label="Navigation principale">
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
