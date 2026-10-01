<script lang="ts">
	import { ClipboardCheck } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import { isOpen, needsTriage } from '$lib/modules/ideas/domain/idea';
	import IdeaCaptureBox from '$lib/connected/ideas/IdeaCaptureBox.svelte';
	import IdeaList from '$lib/connected/ideas/IdeaList.svelte';
	import Collapsible from '$lib/ui/molecules/Collapsible.svelte';
	import HeaderButton from '$lib/ui/molecules/HeaderButton.svelte';
	import Section from '$lib/ui/molecules/Section.svelte';
	import Page from '$lib/ui/templates/Page.svelte';
	import PageHeader from '$lib/ui/templates/PageHeader.svelte';

	const { store } = useProject();
	const open = $derived(store.ideas.items.filter(isOpen));
	const toTriage = $derived(open.filter(needsTriage));
	const kept = $derived(open.filter((idea) => !needsTriage(idea)));
	const archived = $derived(store.ideas.items.filter((idea) => !isOpen(idea)));
</script>

<svelte:head><title>Idées · {store.project.name}</title></svelte:head>

<PageHeader title="Idées">
	{#snippet actions()}
		<HeaderButton href="/p/{store.project.slug}/review"
			><ClipboardCheck size={15} />Lancer la revue de la semaine</HeaderButton
		>
	{/snippet}
</PageHeader>
<Page width="max-w-[820px]">
	<div class="flex flex-col gap-6">
		<div>
			<IdeaCaptureBox />
		</div>
		<Section title="À trier" count={toTriage.length}>
			<div class="rounded-xl border border-line bg-surface">
				{#if toTriage.length}<IdeaList ideas={toTriage} />
				{:else}<p class="p-4 text-ui text-ink-3">
						Tout est trié. Les nouvelles idées arriveront ici.
					</p>{/if}
			</div>
		</Section>
		{#if kept.length}
			<Section title="Gardées pour plus tard" count={kept.length}>
				<div class="rounded-xl border border-line bg-surface"><IdeaList ideas={kept} /></div>
			</Section>
		{/if}
		{#if archived.length}
			<div class="-mx-2.5">
				<Collapsible label="Archivées" count={archived.length}>
					<div class="mx-2.5"><IdeaList ideas={archived} /></div>
				</Collapsible>
			</div>
		{/if}
	</div>
</Page>
