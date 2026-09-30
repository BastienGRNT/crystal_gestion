<script lang="ts">
	import { useProject } from '$lib/client/context';
	import BacklinkList from '$lib/ui/organisms/BacklinkList.svelte';

	let { id, heading = true }: { id: string; heading?: boolean } = $props();
	const { refs } = useProject();
</script>

<BacklinkList items={refs.backlinks(id).map(refs.view)} {heading} />
