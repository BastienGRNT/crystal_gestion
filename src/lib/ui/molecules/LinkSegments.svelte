<script lang="ts" generics="T extends string">
	interface Props {
		value: T;
		label: string;
		tabs: { value: T; label: string; href: string; count?: number }[];
	}

	let { value, label, tabs }: Props = $props();
</script>

<!-- Segmented control made of links: each view is a shareable URL. -->
<nav
	aria-label={label}
	class="inline-flex max-w-full gap-0.5 overflow-x-auto rounded-lg bg-sunken p-0.5"
>
	{#each tabs as tab (tab.value)}
		<a
			href={tab.href}
			data-sveltekit-noscroll
			aria-current={tab.value === value ? 'page' : undefined}
			class="inline-flex h-7 items-center rounded-md px-2.5 text-ui font-medium whitespace-nowrap transition {tab.value ===
			value
				? 'bg-panel text-ink shadow-sm'
				: 'text-ink-3 hover:text-ink'}"
			>{tab.label}{#if tab.count !== undefined}<span class="ml-1.5 text-2xs text-ink-3 tabular-nums"
					>{tab.count}</span
				>{/if}</a
		>
	{/each}
</nav>
