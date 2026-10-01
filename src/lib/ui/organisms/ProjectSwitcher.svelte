<script lang="ts">
	import { Check, ChevronsUpDown, Plus } from '@lucide/svelte';
	import Logo from '../atoms/Logo.svelte';
	import MenuItem from '../molecules/MenuItem.svelte';
	import Popover from '../molecules/Popover.svelte';
	import type { MenuLink } from '../types';

	interface Props {
		current: { slug: string; name: string };
		projects: { slug: string; name: string }[];
		/** About the current project: framing, journal, review… */
		links: MenuLink[];
	}

	let { current, projects, links }: Props = $props();
	let open = $state(false);
</script>

<Popover {open} onclose={() => (open = false)} width="w-64">
	{#snippet trigger()}
		<button
			class="flex h-10 w-full items-center gap-2.5 rounded-lg px-2 text-left transition hover:bg-side-hover"
			onclick={() => (open = !open)}
			aria-expanded={open}
		>
			<Logo size={20} />
			<span class="flex-1 truncate text-sm font-semibold tracking-[-0.01em]">{current.name}</span>
			<ChevronsUpDown size={14} class="text-ink-3" />
		</button>
	{/snippet}
	{#each links as link (link.href)}
		<MenuItem href={link.href} onclick={() => (open = false)}
			><link.icon size={14} />{link.label}</MenuItem
		>
	{/each}
	<div class="my-1 h-px bg-line"></div>
	<p class="px-2.5 pt-1.5 pb-1 text-2xs font-medium text-ink-3">Changer de projet</p>
	{#each projects as project (project.slug)}
		<MenuItem
			href="/p/{project.slug}"
			active={project.slug === current.slug}
			onclick={() => (open = false)}
		>
			<span class="flex-1 truncate">{project.name}</span>
			{#if project.slug === current.slug}<Check size={14} />{/if}
		</MenuItem>
	{/each}
	<div class="my-1 h-px bg-line"></div>
	<MenuItem href="/new"><Plus size={14} /> Nouveau projet</MenuItem>
</Popover>
