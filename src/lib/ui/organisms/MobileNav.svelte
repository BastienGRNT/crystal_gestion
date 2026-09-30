<script lang="ts">
	import { Menu } from '@lucide/svelte';
	import type { NavEntry } from '../types';

	interface Props {
		items: NavEntry[];
		active: string;
		onmenu: () => void;
	}

	let { items, active, onmenu }: Props = $props();
	const tab = 'flex flex-1 flex-col items-center gap-1 pt-2 pb-1.5 text-2xs font-medium';
</script>

<nav
	class="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
	aria-label="Navigation mobile"
>
	{#each items as item (item.key)}
		<a
			href={item.href}
			aria-current={active === item.key ? 'page' : undefined}
			class="{tab} {active === item.key ? 'text-accent-text' : 'text-ink-3'}"
		>
			<item.icon size={20} strokeWidth={active === item.key ? 2.2 : 1.8} />
			{item.label}
		</a>
	{/each}
	<button class="{tab} text-ink-3" onclick={onmenu}><Menu size={20} /> Plus</button>
</nav>
