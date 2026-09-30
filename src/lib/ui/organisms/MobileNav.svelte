<script lang="ts">
	import { Menu } from '@lucide/svelte';
	import { NAVIGATION, type NavKey } from '$lib/client/navigation';

	interface Props {
		slug: string;
		active: NavKey;
		onmenu: () => void;
	}

	let { slug, active, onmenu }: Props = $props();
	const primary = NAVIGATION.filter((item) =>
		['today', 'tasks', 'discussion', 'planning'].includes(item.key)
	);
</script>

<nav
	class="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
	aria-label="Navigation mobile"
>
	{#each primary as item (item.key)}
		<a
			href="/p/{slug}{item.path}"
			class="flex flex-1 flex-col items-center gap-0.5 py-2 text-[10.5px] {active === item.key
				? 'text-accent'
				: 'text-ink-3'}"
		>
			<item.icon size={19} />
			{item.label}
		</a>
	{/each}
	<button
		class="flex flex-1 flex-col items-center gap-0.5 py-2 text-[10.5px] text-ink-3"
		onclick={onmenu}
	>
		<Menu size={19} /> Plus
	</button>
</nav>
