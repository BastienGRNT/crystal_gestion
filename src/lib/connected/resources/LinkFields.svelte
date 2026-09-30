<script lang="ts">
	import { Copy, ExternalLink, Globe, Tags } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import { safeUrl } from '$lib/modules/resources/domain/link';
	import type { Link, LinkFields } from '$lib/modules/resources/domain/resources';
	import IconButton from '$lib/ui/atoms/IconButton.svelte';
	import IconLink from '$lib/ui/atoms/IconLink.svelte';
	import FieldLine from '$lib/ui/molecules/FieldLine.svelte';
	import { copy } from './clipboard';

	let { link }: { link: Link } = $props();
	const { actions } = useProject();
	const save = (changes: Partial<LinkFields>) => actions.resources.updateLink(link.id, changes);
</script>

<div class="flex flex-col">
	<FieldLine
		icon={Globe}
		label="URL"
		value={link.url}
		placeholder="https://…"
		mono
		onsave={(url) => save({ url })}
	>
		{#snippet trailing()}
			<IconLink href={safeUrl(link.url)} label="Ouvrir" external
				><ExternalLink size={13} /></IconLink
			>
			<IconButton size="sm" label="Copier l’URL" onclick={() => copy(link.url, 'Lien')}
				><Copy size={13} /></IconButton
			>
		{/snippet}
	</FieldLine>
	<FieldLine
		icon={Tags}
		label="Tags"
		value={link.tag}
		placeholder="Tags, séparés par des virgules"
		onsave={(tag) => save({ tag })}
	/>
</div>
