<script lang="ts">
	import { ArrowUpRight } from '@lucide/svelte';
	import type { Moscow } from '$lib/modules/features/domain/feature';
	import DeleteButton from '../atoms/DeleteButton.svelte';
	import InlineText from '../molecules/InlineText.svelte';

	interface Props {
		title: string;
		/** Feature threads link back to their feature. */
		feature?: { ref: string; priority: Moscow; href: string };
		/** Channels can be renamed and deleted from their header. */
		channel?: { onrename: (name: string) => void; ondelete: () => void };
	}

	let { title, feature, channel }: Props = $props();
	const scope = $derived(
		feature ? `feature ${feature.ref}` : channel ? 'canal de Général' : 'toute l’équipe'
	);
</script>

<header class="flex min-w-0 flex-1 items-center gap-2.5">
	{#if channel}
		<InlineText value={title} onsave={channel.onrename} class="truncate font-semibold" />
	{:else}
		<h1 class="truncate font-semibold">{title}</h1>
	{/if}
	<span class="hidden truncate text-xs text-ink-3 sm:inline">{scope}</span>
	<span class="flex-1"></span>
	{#if feature}
		<a
			href={feature.href}
			class="inline-flex h-6 items-center gap-1.5 rounded-md border border-line px-2 text-xs text-ink-2 hover:bg-hover hover:no-underline"
			><span class="font-mono">{feature.ref}</span>Voir la feature <ArrowUpRight size={12} /></a
		>
	{:else if channel}
		<div>
			<DeleteButton label="Supprimer le canal et ses messages" onconfirm={channel.ondelete} />
		</div>
	{/if}
</header>
