<script lang="ts">
	import { ArrowUpRight } from '@lucide/svelte';
	import DeleteButton from '../atoms/DeleteButton.svelte';
	import InlineText from '../molecules/InlineText.svelte';

	interface Props {
		title: string;
		/** Feature threads link back to their feature. */
		feature?: { ref: string; href: string };
		/** Channels can be renamed and deleted from their header. */
		channel?: { onrename: (name: string) => void; ondelete: () => void };
	}

	let { title, feature, channel }: Props = $props();
	const scope = $derived(
		feature ? 'fil de la Feat' : channel ? 'canal de Général' : 'toute l’équipe'
	);
</script>

<header class="flex min-w-0 flex-1 items-center gap-2.5">
	{#if channel}
		<InlineText value={title} onsave={channel.onrename} class="truncate text-xl font-extrabold" />
	{:else}
		<h2 class="truncate text-xl font-extrabold">{title}</h2>
	{/if}
	<span class="hidden truncate text-ui text-ink-3 sm:inline">{scope}</span>
	<span class="flex-1"></span>
	{#if feature}
		<a
			href={feature.href}
			class="inline-flex h-9 items-center gap-1.5 rounded-[10px] border-[1.5px] border-line-strong px-3 text-ui font-bold text-ink hover:border-ink-3 hover:no-underline"
			>Voir la Feat <ArrowUpRight size={12} /></a
		>
	{:else if channel}
		<div>
			<DeleteButton label="Supprimer le canal et ses messages" onconfirm={channel.ondelete} />
		</div>
	{/if}
</header>
