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
	title={shortcut ? `${label} (${shortcut})` : label}
	aria-current={active ? 'page' : undefined}
	class="flex h-[34px] items-center gap-2.5 rounded-lg px-2.5 text-sm transition {active
		? 'bg-panel font-medium text-ink shadow-[0_1px_2px_rgb(0_0_0/0.06)]'
		: 'text-ink-2 hover:bg-side-hover hover:text-ink'}"
>
	<Icon size={16} />
	<span class="flex-1">{label}</span>
	{#if badge > 0}
		<span
			class="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent-soft px-1.5 text-2xs font-semibold text-accent-text"
			>{badge}</span
		>
	{/if}
</a>
