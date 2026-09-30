<script lang="ts">
	import type { Component } from 'svelte';

	interface Props {
		href: string;
		label: string;
		icon: Component<{ size?: number; strokeWidth?: number }>;
		active: boolean;
		badge?: number;
		shortcut?: string;
	}

	let { href, label, icon: Icon, active, badge = 0, shortcut }: Props = $props();
</script>

<a
	{href}
	title={shortcut ? `${label} (${shortcut.toUpperCase()})` : label}
	aria-current={active ? 'page' : undefined}
	class="group relative flex h-9 items-center gap-3 rounded-lg px-2.5 text-base transition {active
		? 'bg-surface font-medium text-ink shadow-[0_1px_2px_rgb(0_0_0/0.06)]'
		: 'text-ink-2 hover:bg-surface/60 hover:text-ink'}"
>
	{#if active}<span class="absolute top-2 bottom-2 -left-3 w-[3px] rounded-r-full bg-accent"
		></span>{/if}
	<Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
	<span class="flex-1">{label}</span>
	{#if badge > 0}
		<span class="rounded-full bg-accent-soft px-1.5 font-mono text-2xs font-medium text-accent-text"
			>{badge}</span
		>
	{/if}
</a>
