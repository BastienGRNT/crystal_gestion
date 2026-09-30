<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Lightbulb } from '@lucide/svelte';
	import Kbd from '../atoms/Kbd.svelte';
	import NavLink from '../molecules/NavLink.svelte';
	import SearchButton from '../molecules/SearchButton.svelte';
	import type { NavSection } from '../types';
	import ProjectSwitcher from './ProjectSwitcher.svelte';

	interface Props {
		project: { slug: string; name: string };
		projects: { slug: string; name: string }[];
		sections: NavSection[];
		active: string;
		onsearch: () => void;
		onidea: () => void;
		timer?: Snippet;
		footer: Snippet;
	}

	let { project, projects, sections, active, onsearch, onidea, timer, footer }: Props = $props();
</script>

<aside class="flex h-full w-64 shrink-0 flex-col border-r border-line bg-sidebar">
	<div class="flex flex-col gap-3 px-3 pt-3">
		<ProjectSwitcher current={project} {projects} />
		<SearchButton onclick={onsearch} />
	</div>
	<nav
		class="mt-3 flex flex-col gap-5 overflow-y-auto px-3 py-2"
		aria-label="Navigation principale"
	>
		{#each sections as section (section.label)}
			<div class="flex flex-col gap-0.5">
				<p class="mb-1 px-2.5 text-2xs font-semibold tracking-[0.08em] text-ink-3 uppercase">
					{section.label}
				</p>
				{#each section.items as item (item.key)}
					<NavLink {...item} active={active === item.key} />
				{/each}
			</div>
		{/each}
	</nav>
	<div class="mt-auto flex flex-col gap-2 px-3 pb-3">
		{@render timer?.()}
		<button
			onclick={onidea}
			class="flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-base text-ink-2 transition hover:bg-surface/70 hover:text-ink"
		>
			<Lightbulb size={16} /> <span class="flex-1 text-left">Noter une idée</span>
			<Kbd>I</Kbd>
		</button>
	</div>
	{@render footer()}
</aside>
