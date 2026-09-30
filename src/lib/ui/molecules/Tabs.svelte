<script lang="ts" generics="T extends string">
	import type { Component } from 'svelte';

	interface Tab {
		value: T;
		label: string;
		/** Shown on narrow screens so every tab stays visible without scrolling. */
		short?: string;
		href: string;
		count?: number;
		icon?: Component<{ size?: number }>;
	}

	let { value, tabs, label }: { value: T; tabs: Tab[]; label: string } = $props();
</script>

<!-- Links rather than buttons: each tab is a shareable URL and survives a reload. -->
<nav
	aria-label={label}
	class="-mx-4 flex [scrollbar-width:none] gap-1 overflow-x-auto border-b border-line px-4 sm:mx-0 sm:px-0"
>
	{#each tabs as tab (tab.value)}
		{@const active = tab.value === value}
		<a
			href={tab.href}
			data-sveltekit-noscroll
			data-sveltekit-replacestate
			aria-current={active ? 'page' : undefined}
			class="relative flex h-10 shrink-0 items-center gap-1.5 px-2 text-[13.5px] transition sm:gap-2 sm:px-2.5 {active
				? 'font-medium text-ink'
				: 'text-ink-3 hover:text-ink-2'}"
		>
			{#if tab.icon}<span class="hidden sm:inline"><tab.icon size={14} /></span>{/if}
			<span class="sm:hidden">{tab.short ?? tab.label}</span>
			<span class="hidden sm:inline">{tab.label}</span>
			{#if tab.count !== undefined}
				<span
					class="rounded-[4px] px-1 font-mono text-[11px] {active
						? 'bg-accent-soft text-accent'
						: 'bg-sunken text-ink-3'}">{tab.count}</span
				>
			{/if}
			{#if active}<span class="absolute inset-x-1.5 -bottom-px h-0.5 rounded-full bg-accent"
				></span>{/if}
		</a>
	{/each}
</nav>
