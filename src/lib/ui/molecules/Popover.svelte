<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Placement } from '../types';

	interface Props {
		open: boolean;
		anchor: HTMLElement | undefined;
		placement?: Placement;
		label?: string;
		class?: string;
		children: Snippet;
	}

	let {
		open = $bindable(),
		anchor,
		placement = 'bottom-start',
		label,
		class: extra = '',
		children
	}: Props = $props();

	let panel = $state<HTMLDivElement>();
	const GAP = 6;
	const MARGIN = 8;

	/** Under (or above) the anchor, flipped and clamped so it never leaves the screen. */
	function place() {
		if (!panel || !anchor) return;
		const a = anchor.getBoundingClientRect();
		const p = panel.getBoundingClientRect();
		const [side, align] = placement.split('-');
		let top = side === 'bottom' ? a.bottom + GAP : a.top - p.height - GAP;
		if (side === 'bottom' && top + p.height > innerHeight - MARGIN) top = a.top - p.height - GAP;
		if (side === 'top' && top < MARGIN) top = a.bottom + GAP;
		let left = align === 'start' ? a.left : a.right - p.width;
		left = Math.max(MARGIN, Math.min(left, innerWidth - p.width - MARGIN));
		top = Math.max(MARGIN, Math.min(top, innerHeight - p.height - MARGIN));
		panel.style.left = `${left}px`;
		panel.style.top = `${top}px`;
	}

	$effect(() => {
		if (!panel) return;
		const shown = panel.matches(':popover-open');
		if (open && !shown) {
			panel.showPopover();
			place();
		}
		if (!open && shown) panel.hidePopover();
	});

	$effect(() => {
		if (!open) return;
		const update = () => place();
		addEventListener('resize', update);
		addEventListener('scroll', update, true);
		return () => {
			removeEventListener('resize', update);
			removeEventListener('scroll', update, true);
		};
	});
</script>

<div
	bind:this={panel}
	popover="auto"
	aria-label={label}
	ontoggle={(event) => {
		if ((event as ToggleEvent).newState === 'closed') open = false;
		else place();
	}}
	class={[
		'fixed inset-auto m-0 rounded-xl border border-line bg-surface p-1 text-ink shadow-pop open:animate-pop',
		extra
	]}
>
	{#if open}{@render children()}{/if}
</div>
