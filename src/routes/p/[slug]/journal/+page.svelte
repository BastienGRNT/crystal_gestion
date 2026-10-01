<script lang="ts">
	import { useProject } from '$lib/client/context';
	import JournalBrowser from '$lib/connected/journal/JournalBrowser.svelte';
	import ProjectTabs from '$lib/connected/project/ProjectTabs.svelte';
	import Page from '$lib/ui/templates/Page.svelte';
	import PageHeader from '$lib/ui/templates/PageHeader.svelte';

	const { store } = useProject();
</script>

<svelte:head><title>Décisions · {store.project.name}</title></svelte:head>

<PageHeader
	title="Le projet"
	meta="Ce qu’on a décidé et pourquoi. Une décision se garde depuis un message de la discussion."
>
	{#snippet tabs()}<ProjectTabs value="journal" />{/snippet}
</PageHeader>
<Page width="max-w-[1000px]"><JournalBrowser /></Page>
