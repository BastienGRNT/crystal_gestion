<script lang="ts" generics="T extends string">
	import type { Component, Snippet } from 'svelte';

	interface Tab {
		value: T;
		label: string;
		icon?: Component<{ size?: number }>;
		count?: number;
		/** Links make each tab a shareable URL; without, `onchange` is called. */
		href?: string;
	}

	interface Props {
		label: string;
		value: T;
		tabs: Tab[];
		onchange?: (value: T) => void;
		/** Right end of the tab bar: filters. */
		aside?: Snippet;
	}

	let { label, value, tabs, onchange, aside }: Props = $props();
	const base =
		'-mb-[1.5px] inline-flex h-12 shrink-0 items-center gap-2 border-b-[3px] px-4 text-[15.5px] font-bold whitespace-nowrap transition hover:no-underline';
</script>

<!-- The sub-sections of a page, big enough to be seen: never tiny pills in a corner. -->
<div class="flex items-end gap-4 border-b-[1.5px] border-line">
	<nav aria-label={label} class="-ml-4 flex min-w-0 gap-1 overflow-x-auto">
		{#each tabs as tab (tab.value)}
			{@const on = tab.value === value}
			<svelte:element
				this={tab.href ? 'a' : 'button'}
				href={tab.href}
				type={tab.href ? undefined : 'button'}
				role={tab.href ? undefined : 'tab'}
				aria-current={on ? 'page' : undefined}
				data-sveltekit-noscroll
				onclick={() => onchange?.(tab.value)}
				class="{base} {on ? 'border-ink text-ink' : 'border-transparent text-ink-3 hover:text-ink'}"
			>
				{#if tab.icon}<tab.icon size={18} />{/if}{tab.label}
				{#if tab.count}<span
						class="rounded-full bg-sunken px-2 py-px text-xs font-bold text-ink-2 tabular-nums"
						>{tab.count}</span
					>{/if}
			</svelte:element>
		{/each}
	</nav>
	{#if aside}<div class="ml-auto flex shrink-0 items-center gap-2 pb-2 max-md:hidden">
			{@render aside()}
		</div>{/if}
</div>
