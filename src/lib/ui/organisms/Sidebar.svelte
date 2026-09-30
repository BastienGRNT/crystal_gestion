<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Lightbulb } from '@lucide/svelte';
	import { NAVIGATION, type NavKey } from '$lib/client/navigation';
	import Kbd from '../atoms/Kbd.svelte';
	import NavLink from '../molecules/NavLink.svelte';
	import SearchButton from '../molecules/SearchButton.svelte';
	import ProjectSwitcher from './ProjectSwitcher.svelte';

	interface Props {
		project: { slug: string; name: string };
		projects: { slug: string; name: string }[];
		active: NavKey;
		badges: Partial<Record<NavKey, number>>;
		onsearch: () => void;
		onidea: () => void;
		timer?: Snippet;
		footer: Snippet;
	}

	let { project, projects, active, badges, onsearch, onidea, timer, footer }: Props = $props();
</script>

<aside class="flex h-full w-60 shrink-0 flex-col border-r border-line bg-sidebar">
	<div class="flex flex-col gap-3 px-3 pt-3">
		<ProjectSwitcher current={project} {projects} />
		<SearchButton onclick={onsearch} />
	</div>
	<nav class="mt-4 flex flex-col gap-0.5 px-3" aria-label="Navigation principale">
		{#each NAVIGATION as item (item.key)}
			<NavLink
				href="/p/{project.slug}{item.path}"
				label={item.label}
				icon={item.icon}
				active={active === item.key}
				badge={badges[item.key]}
				shortcut={item.shortcut}
			/>
		{/each}
	</nav>
	<div class="mt-auto flex flex-col gap-2 px-3 pb-3">
		{@render timer?.()}
		<button
			onclick={onidea}
			class="flex h-8 items-center gap-2 rounded-md px-2.5 text-[13px] text-ink-2 transition hover:bg-surface/70 hover:text-ink"
		>
			<Lightbulb size={15} /> <span class="flex-1 text-left">Noter une idée</span>
			<Kbd>I</Kbd>
		</button>
	</div>
	{@render footer()}
</aside>
