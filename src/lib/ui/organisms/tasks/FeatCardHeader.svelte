<script lang="ts">
	import { Archive, ChevronDown } from '@lucide/svelte';
	import Avatar from '../../atoms/Avatar.svelte';
	import Dot from '../../atoms/Dot.svelte';
	import type { Person } from '../../types';

	interface Props {
		title: string;
		color: string;
		href: string;
		description: string;
		priority: { label: string; color: string };
		owner: Person | null;
		done: number;
		total: number;
		open: boolean;
		ontoggle: () => void;
		/** Shown when every task is done. */
		onarchive?: () => void;
	}

	let {
		title,
		color,
		href,
		description,
		priority,
		owner,
		done,
		total,
		open,
		ontoggle,
		onarchive
	}: Props = $props();
	const ratio = $derived(total ? done / total : 0);
</script>

<header class="flex items-center gap-4 px-5 py-4">
	<button
		type="button"
		onclick={ontoggle}
		aria-expanded={open}
		aria-label={open ? 'Replier' : 'Déplier'}
		class="flex size-8 shrink-0 items-center justify-center rounded-lg text-ink-3 hover:bg-hover hover:text-ink"
	>
		<ChevronDown size={18} class="transition {open ? '' : '-rotate-90'}" />
	</button>
	<span class="size-4 shrink-0 rounded-[5px]" style="background:{color}"></span>
	<div class="min-w-0 flex-1">
		<a {href} class="text-[19px] font-extrabold tracking-[-0.01em] hover:underline">{title}</a>
		{#if description}<p class="truncate text-ui text-ink-2">{description}</p>{/if}
	</div>
	{#if onarchive}
		<button
			type="button"
			onclick={onarchive}
			class="inline-flex h-9 shrink-0 items-center gap-2 rounded-[10px] bg-accent-soft px-3 text-ui font-bold text-accent-text hover:brightness-95"
			><Archive size={15} />Terminée · Archiver</button
		>
	{/if}
	<span class="hidden shrink-0 items-center gap-2 text-ui font-bold text-ink-2 md:flex"
		><Dot color={priority.color} size={8} />{priority.label}</span
	>
	{#if owner}<span class="shrink-0" title="Responsable : {owner.name}"
			><Avatar name={owner.name} color={owner.color} size={28} /></span
		>{/if}
	<span class="flex shrink-0 items-center gap-3">
		<span class="text-ui font-bold tabular-nums">{done} / {total}</span>
		<span class="hidden h-1.5 w-28 overflow-hidden rounded-full bg-sunken sm:block">
			<span
				class="block h-full rounded-full transition-[width] duration-500 {ratio >= 1
					? 'prism'
					: ''}"
				style="width:{Math.round(ratio * 100)}%;{ratio >= 1 ? '' : `background:${color}`}"
			></span>
		</span>
	</span>
</header>
