<script lang="ts">
	import { useProject } from '$lib/client/context';
	import Page from '$lib/ui/templates/Page.svelte';
	import PageHeader from '$lib/ui/templates/PageHeader.svelte';

	const { me } = useProject();
</script>

<Page><PageHeader eyebrow="Aujourd'hui" title="Bonjour {me.name}" /></Page>
