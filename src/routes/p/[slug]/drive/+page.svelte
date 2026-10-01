<script lang="ts">
	import { page } from '$app/state';
	import { useProject } from '$lib/client/context';
	import FilesTab from '$lib/connected/resources/FilesTab.svelte';
	import { GENERAL_FOLDER } from '$lib/connected/resources/options';
	import Page from '$lib/ui/templates/Page.svelte';
	import PageHeader from '$lib/ui/templates/PageHeader.svelte';

	const { store } = useProject();
	// `?feature=F-3` opens that feature's folder (link from the feature page).
	const ref = page.url.searchParams.get('feature');
	const initial = store.features.items.find((f) => f.ref === ref)?.id ?? GENERAL_FOLDER;
	const count = $derived(store.files.items.length);
</script>

<svelte:head><title>Drive · {store.project.name}</title></svelte:head>

<PageHeader
	title="Drive"
	meta="Les fichiers du projet : un dossier Général et un dossier par Feat · {count} fichier{count >
	1
		? 's'
		: ''}"
/>
<Page width="max-w-[1240px]"><FilesTab {initial} /></Page>
