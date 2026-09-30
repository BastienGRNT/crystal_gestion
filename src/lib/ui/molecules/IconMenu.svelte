<script lang="ts">
	import type { Component } from 'svelte';
	import type { MenuAction } from '../discussion';
	import IconButton from '../atoms/IconButton.svelte';
	import MenuItem from './MenuItem.svelte';
	import Popover from './Popover.svelte';

	interface Props {
		label: string;
		icon: Component<{ size?: number }>;
		items: MenuAction[];
		heading?: string;
	}

	let { label, icon: Icon, items, heading }: Props = $props();
	let open = $state(false);
	let side = $state<'top' | 'bottom'>('bottom');

	// Opens upwards in the lower part of the screen so the menu is never cut by the composer.
	function toggle(event: MouseEvent) {
		const { top } = (event.currentTarget as HTMLElement).getBoundingClientRect();
		side = top > window.innerHeight * 0.55 ? 'top' : 'bottom';
		open = !open;
	}
</script>

<div data-open={open || undefined}>
	<Popover {open} align="end" {side} width="w-52" onclose={() => (open = false)}>
		{#snippet trigger()}
			<IconButton {label} size="sm" active={open} onclick={toggle}><Icon size={14} /></IconButton>
		{/snippet}
		{#if heading}
			<p class="px-2.5 pt-1.5 pb-1 text-[11px] font-medium tracking-wide text-ink-3 uppercase">
				{heading}
			</p>
		{/if}
		{#each items as item (item.label)}
			<MenuItem tone={item.tone} onclick={() => ((open = false), item.run())}>
				{#if item.icon}<item.icon size={14} />{/if}{item.label}
			</MenuItem>
		{/each}
	</Popover>
</div>
