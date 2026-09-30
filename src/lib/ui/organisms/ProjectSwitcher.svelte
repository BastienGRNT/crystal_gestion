<script lang="ts">
	import { Check, ChevronsUpDown, Plus } from '@lucide/svelte';
	import Logo from '../atoms/Logo.svelte';
	import MenuItem from '../molecules/MenuItem.svelte';
	import Popover from '../molecules/Popover.svelte';

	interface Props {
		current: { slug: string; name: string };
		projects: { slug: string; name: string }[];
	}

	let { current, projects }: Props = $props();
	let open = $state(false);
</script>

<Popover {open} onclose={() => (open = false)} width="w-56">
	{#snippet trigger()}
		<button
			class="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition hover:bg-surface/70"
			onclick={() => (open = !open)}
			aria-expanded={open}
		>
			<Logo size={22} />
			<span class="flex-1 truncate font-semibold tracking-tight">{current.name}</span>
			<ChevronsUpDown size={14} class="text-ink-3" />
		</button>
	{/snippet}
	<p class="px-2.5 pt-1.5 pb-1 text-2xs font-medium tracking-wide text-ink-3 uppercase">Projets</p>
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
