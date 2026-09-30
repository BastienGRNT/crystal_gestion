<script lang="ts">
	import { KIND_META } from '$lib/client/refs/kinds';
	import type { RefView } from '../types';

	let { view, fallback }: { view?: RefView; fallback: string } = $props();
	let hovering = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;

	const show = () => (timer = setTimeout(() => (hovering = true), 280));
	const hide = () => (clearTimeout(timer), (hovering = false));
</script>

{#if view}
	{@const Icon = KIND_META[view.kind].icon}
	<span
		class="relative inline-flex align-baseline"
		role="presentation"
		onmouseenter={show}
		onmouseleave={hide}
	>
		<a
			href={view.href}
			class="inline-flex max-w-[22rem] items-baseline gap-1 rounded-[5px] bg-accent-soft/70 px-1 leading-snug text-accent no-underline transition hover:bg-accent-soft"
		>
			<span class="font-mono text-[0.82em] opacity-80">{view.ref}</span>
			<span class="truncate">{view.title}</span>
		</a>
		{#if hovering}
			<span
				class="absolute top-full left-0 z-50 mt-1.5 block w-72 animate-rise rounded-lg border border-line bg-surface p-3 text-left text-sm text-ink shadow-pop"
			>
				<span class="flex items-center gap-1.5 text-xs text-ink-3">
					<Icon size={12} />{KIND_META[view.kind].label} · <span class="font-mono">{view.ref}</span>
					{#if view.status}<span class="ml-auto rounded bg-sunken px-1.5 py-0.5 text-ink-2"
							>{view.status}</span
						>{/if}
				</span>
				<span class="mt-1.5 block font-medium">{view.title}</span>
			</span>
		{/if}
	</span>
{:else}
	<span
		class="font-mono text-[0.85em] text-ink-3 line-through decoration-ink-3/40"
		title="Élément introuvable">#{fallback}</span
	>
{/if}
