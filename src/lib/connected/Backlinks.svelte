<script lang="ts">
	import { useProject } from '$lib/client/context';
	import type { ElementKind } from '$lib/modules/kernel/domain/element';
	import BacklinkList from '$lib/ui/organisms/BacklinkList.svelte';

	interface Props {
		id: string;
		heading?: boolean;
		/** Leave out a kind shown elsewhere (messages, in the discussion block). */
		except?: ElementKind;
		/** In a panel: a separated section, shown only when something cites the element. */
		framed?: boolean;
	}

	let { id, heading = true, except, framed = false }: Props = $props();
	const { refs } = useProject();
	const items = $derived(refs.backlinks(id).filter((element) => element.kind !== except));
</script>

{#if framed}
	{#if items.length}
		<div class="mt-6 border-t border-line pt-5">
			<BacklinkList items={items.map(refs.view)} {heading} />
		</div>
	{/if}
{:else}
	<BacklinkList items={items.map(refs.view)} {heading} />
{/if}
