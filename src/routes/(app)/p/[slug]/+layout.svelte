<script lang="ts">
	import { useApp } from '$lib/client/context';
	import { rememberProject } from '$lib/client/views/workspace';
	import { currentProject } from '$lib/connected/projects/current.svelte';
	import Button from '$lib/ui/atoms/Button.svelte';
	import EmptyState from '$lib/ui/molecules/EmptyState.svelte';

	let { children } = $props();
	const { app } = useApp();
	const project = $derived(currentProject(app));

	$effect(() => {
		if (project) rememberProject(project.slug);
	});
</script>

<svelte:head><title>{project?.name ?? 'Projet'} · Crystal</title></svelte:head>

{#if project}
	{#if project.archivedAt}
		<p class="bg-sunken px-4 py-2 text-center text-sm text-ink-2">
			Ce projet est archivé. Tu peux le ressortir depuis « Équipe et réglages ».
		</p>
	{/if}
	{@render children()}
{:else}
	<div class="mx-auto max-w-xl px-4 py-20">
		<EmptyState
			title="Ce projet n’existe pas, ou tu n’en fais pas partie"
			text="Demande un lien d’invitation à son équipe, ou retrouve tes projets."
		>
			<Button href="/projets" variant="primary">Mes projets</Button>
		</EmptyState>
	</div>
{/if}
