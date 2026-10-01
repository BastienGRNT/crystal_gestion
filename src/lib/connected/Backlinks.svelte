<script lang="ts">
	import { useProject } from '$lib/client/context';
	import type { ElementKind } from '$lib/modules/kernel/domain/element';
	import BacklinkList from '$lib/ui/organisms/BacklinkList.svelte';

	interface Props {
		id: string;
		heading?: boolean;
		/** Leave out a kind shown elsewhere (messages, in the discussion block). */
		except?: ElementKind;
	}

	let { id, heading = true, except }: Props = $props();
	const { refs } = useProject();
	const items = $derived(refs.backlinks(id).filter((element) => element.kind !== except));
</script>

<BacklinkList items={items.map(refs.view)} {heading} />
