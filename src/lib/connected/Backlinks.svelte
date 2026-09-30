<script lang="ts">
	import { useProject } from '$lib/client/context';
	import BacklinkList from '$lib/ui/organisms/BacklinkList.svelte';

	let { id }: { id: string } = $props();
	const { refs } = useProject();
</script>

<BacklinkList items={refs.backlinks(id).map(refs.view)} />
