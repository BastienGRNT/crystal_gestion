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
	title={shortcut ? `${label} (touche ${shortcut})` : label}
	aria-current={active ? 'page' : undefined}
	class="flex h-11 items-center gap-3 rounded-[10px] px-3 text-[15px] font-semibold transition hover:no-underline {active
		? 'bg-side-active text-white'
		: 'text-side-ink-2 hover:bg-side-hover hover:text-side-ink'}"
>
	<Icon size={19} strokeWidth={active ? 2.2 : 1.9} />
	<span class="flex-1">{label}</span>
	{#if badge > 0}
		<span
			class="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-2xs font-bold text-white"
			>{badge}</span
		>
	{:else if shortcut}<span class="text-xs text-side-ink-3">{shortcut}</span>{/if}
</a>
