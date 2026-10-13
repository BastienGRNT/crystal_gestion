<script lang="ts">
	import type { Icon } from '../types';

	interface Tab {
		href: string;
		label: string;
		icon?: Icon;
		count?: number;
		active: boolean;
	}

	let { tabs, label }: { tabs: Tab[]; label: string } = $props();
</script>

<nav aria-label={label} class="-mb-px flex scrollbar-thin gap-1 overflow-x-auto">
	{#each tabs as tab (tab.href)}
		<a
			href={tab.href}
			aria-current={tab.active ? 'page' : undefined}
			class={[
				'group relative flex h-10 shrink-0 items-center gap-2 rounded-t-lg px-3 text-base font-medium transition-colors',
				tab.active ? 'text-ink' : 'text-ink-3 hover:text-ink'
			]}
		>
			{#if tab.icon}<tab.icon
					size={16}
					aria-hidden="true"
					class={tab.active ? '' : 'opacity-70'}
				/>{/if}
			{tab.label}
			{#if tab.count}
				<span
					class={[
						'rounded-md px-1.5 text-xs font-semibold tabular-nums',
						tab.active ? 'bg-accent-soft text-accent-text' : 'bg-sunken text-ink-3'
					]}>{tab.count}</span
				>
			{/if}
			<span
				class={[
					'absolute inset-x-2 bottom-0 h-0.5 rounded-full transition-colors',
					tab.active ? 'bg-ink' : 'bg-transparent group-hover:bg-line-strong'
				]}
			></span>
		</a>
	{/each}
</nav>
