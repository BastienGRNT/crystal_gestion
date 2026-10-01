<script lang="ts">
	import { useProject } from '$lib/client/context';
	import { overlays } from '$lib/client/overlays.svelte';
	import JournalBrowser from '$lib/connected/journal/JournalBrowser.svelte';
	import ProjectTabs from '$lib/connected/project/ProjectTabs.svelte';
	import HeaderButton from '$lib/ui/molecules/HeaderButton.svelte';
	import Page from '$lib/ui/templates/Page.svelte';
	import PageHeader from '$lib/ui/templates/PageHeader.svelte';

	const { store } = useProject();
	const compose = (kind: 'decision' | 'fix') => overlays.openCreate(kind);
</script>

<svelte:head><title>Journal · {store.project.name}</title></svelte:head>

<PageHeader title="Features">
	{#snippet actions()}
		<ProjectTabs value="journal" />
		<HeaderButton shortcut="R" onclick={() => compose('fix')}>Bug résolu</HeaderButton>
		<HeaderButton primary shortcut="D" onclick={() => compose('decision')}>+ Décision</HeaderButton>
	{/snippet}
</PageHeader>
<Page width="max-w-[1000px]">
	<p class="mb-6 text-sm text-ink-2">
		Ce qu’on a décidé et pourquoi, les bugs corrigés et comment. Les changements de priorité des
		features s’y notent tout seuls.
	</p>
	<JournalBrowser oncompose={compose} />
</Page>
