<script lang="ts">
	import { useProject } from '$lib/client/context';
	import { overlays } from '$lib/client/overlays.svelte';
	import Features from '$lib/connected/project/Features.svelte';
	import ProjectTabs from '$lib/connected/project/ProjectTabs.svelte';
	import HeaderButton from '$lib/ui/molecules/HeaderButton.svelte';
	import Page from '$lib/ui/templates/Page.svelte';
	import PageHeader from '$lib/ui/templates/PageHeader.svelte';

	const { store } = useProject();
</script>

<svelte:head><title>Features · {store.project.name}</title></svelte:head>

<PageHeader title="Features">
	{#snippet actions()}
		<ProjectTabs value="features" />
		<HeaderButton primary shortcut="F" onclick={() => overlays.openCreate('feature')}
			>+ Feature</HeaderButton
		>
	{/snippet}
</PageHeader>
<Page width="max-w-[1100px]"><Features /></Page>
