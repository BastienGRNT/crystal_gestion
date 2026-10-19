<script lang="ts">
	import { useApp } from '$lib/client/context';
	import Budget from '$lib/connected/metrics/Budget.svelte';
	import ProductNumbers from '$lib/connected/metrics/ProductNumbers.svelte';
	import TeamRhythm from '$lib/connected/metrics/TeamRhythm.svelte';
	import { currentProject } from '$lib/connected/projects/current.svelte';
	import PageHeader from '$lib/ui/organisms/PageHeader.svelte';

	const { app } = useApp();
	const project = $derived(currentProject(app));
</script>

<svelte:head><title>Indicateurs · {project?.name ?? ''} · Crystal</title></svelte:head>

{#if project}
	<PageHeader
		title="Indicateurs"
		subtitle="Le produit va-t-il bien, l’équipe aussi ? Les chiffres du projet se notent en dix secondes par semaine, ceux de l’équipe se calculent tout seuls."
	/>
	<div class="mx-auto flex max-w-[1240px] flex-col gap-10 px-4 pb-12 sm:px-8">
		{#key project.id}
			<ProductNumbers {project} />
			<TeamRhythm {project} />
			<Budget {project} />
		{/key}
	</div>
{/if}
