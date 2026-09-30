<script lang="ts">
	import { useProject } from '$lib/client/context';
	import type { ElementSummary } from '$lib/modules/kernel/domain/element';
	import InlineText from '$lib/ui/molecules/InlineText.svelte';
	import DeleteButton from '$lib/ui/atoms/DeleteButton.svelte';
	import PropertyRow from '$lib/ui/molecules/PropertyRow.svelte';
	import AccountFields from '../resources/AccountFields.svelte';
	import ContactFields from '../resources/ContactFields.svelte';
	import FeatureChip from '../resources/FeatureChip.svelte';
	import LinkFields from '../resources/LinkFields.svelte';
	import Backlinks from '../Backlinks.svelte';
	import { resourceOps } from '../resources/ops';
	import DetailMeta from './DetailMeta.svelte';
	import ResourceShortcut from './ResourceShortcut.svelte';

	let { element, onclose }: { element: ElementSummary; onclose: () => void } = $props();
	const project = useProject();
	const ops = $derived(resourceOps(project, element));
	const item = $derived(ops.item());
</script>

{#if item}
	<div class="flex items-start gap-3">
		<InlineText
			value={item.title}
			onsave={ops.rename}
			class="font-display text-3xl leading-tight"
		/>
		<span class="mt-2"><DeleteButton onconfirm={() => (ops.remove(), onclose())} /></span>
	</div>
	<DetailMeta {element} />
	<ResourceShortcut {item} />
	<section class="mt-5 border-t border-line pt-3">
		{#if item.kind === 'account'}<AccountFields account={item} />
		{:else if item.kind === 'link'}<LinkFields link={item} />
		{:else}<ContactFields contact={item} />{/if}
	</section>
	{#if item.kind !== 'contact'}
		<div class="mt-3 border-t border-line pt-3">
			<PropertyRow label="Feature">
				<FeatureChip value={item.featureId} onchange={(featureId) => ops.move(featureId)} />
			</PropertyRow>
		</div>
	{/if}
	<div class="mt-6 border-t border-line pt-5"><Backlinks id={item.id} /></div>
{/if}
