<script lang="ts">
	import { Copy, Link2 } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import { linkTags } from '$lib/modules/resources/domain/link';
	import type { Link } from '$lib/modules/resources/domain/resources';
	import IconButton from '$lib/ui/atoms/IconButton.svelte';
	import Tag from '$lib/ui/atoms/Tag.svelte';
	import ConfirmDelete from '$lib/ui/molecules/ConfirmDelete.svelte';
	import { copy } from './clipboard';
	import FeatureChip from './FeatureChip.svelte';
	import LinkTitle from './LinkTitle.svelte';

	let { link, ontag }: { link: Link; ontag: (tag: string) => void } = $props();
	const { actions, peek } = useProject();
</script>

<li class="group flex animate-rise flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2.5">
	<span class="flex size-8 shrink-0 items-center justify-center rounded-md bg-sunken text-ink-3"
		><Link2 size={14} /></span
	>
	<LinkTitle {link} />
	<div class="flex flex-wrap items-center gap-1.5 pl-11 sm:pl-0">
		{#each linkTags(link.tag) as tag (tag)}<Tag {tag} onclick={() => ontag(tag)} />{/each}
		<FeatureChip
			value={link.featureId}
			onchange={(featureId) => actions.resources.updateLink(link.id, { featureId })}
		/>
		<button
			type="button"
			onclick={() => peek(link.ref)}
			title="Ouvrir le détail"
			class="w-10 text-right font-mono text-2xs text-ink-3 transition hover:text-accent"
			>{link.ref}</button
		>
		<span
			class="flex transition md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100"
		>
			{#if link.url}<IconButton
					size="sm"
					label="Copier l’URL"
					onclick={() => copy(link.url, 'Lien')}><Copy size={13} /></IconButton
				>{/if}
			<ConfirmDelete onconfirm={() => actions.resources.removeLink(link.id)} />
		</span>
	</div>
</li>
