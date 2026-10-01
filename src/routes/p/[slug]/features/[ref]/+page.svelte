<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Archive, ArchiveRestore, FileQuestion, FolderOpen, Trash2 } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import { formatDay } from '$lib/client/format';
	import { progressOf } from '$lib/modules/tasks/domain/progress';
	import Thread from '$lib/connected/discussion/Thread.svelte';
	import FeatureHeader from '$lib/connected/feature/FeatureHeader.svelte';
	import FeatureLinks from '$lib/connected/feature/FeatureLinks.svelte';
	import FeatureTasks from '$lib/connected/feature/FeatureTasks.svelte';
	import EmptyState from '$lib/ui/molecules/EmptyState.svelte';
	import HeaderButton from '$lib/ui/molecules/HeaderButton.svelte';
	import InlineRichText from '$lib/ui/molecules/InlineRichText.svelte';
	import Section from '$lib/ui/molecules/Section.svelte';
	import Page from '$lib/ui/templates/Page.svelte';
	import PageHeader from '$lib/ui/templates/PageHeader.svelte';

	const { store, actions: act, refs } = useProject();
	const feature = $derived(store.features.items.find((f) => f.ref === page.params.ref));
	const base = $derived(`/p/${store.project.slug}`);
	const progress = $derived(
		progressOf(store.tasks.items.filter((t) => t.featureId === feature?.id))
	);
	const finished = $derived(progress.total > 0 && progress.ratio === 1);
	const files = $derived(store.files.items.filter((f) => f.featureId === feature?.id).length);

	function remove() {
		act.features.remove(feature!.id);
		goto(`${base}/tasks`);
	}
</script>

<svelte:head><title>{feature?.title ?? 'Feature'} · {store.project.name}</title></svelte:head>

<PageHeader title="Feature" meta={feature?.ref}>
	{#snippet actions()}
		{#if feature}
			<HeaderButton href="{base}/drive?feature={feature.ref}"
				><FolderOpen size={14} />Fichiers{files ? ` · ${files}` : ''}</HeaderButton
			>
			{#if feature.archivedAt}
				<HeaderButton onclick={() => act.features.archive(feature.id, false)}
					><ArchiveRestore size={14} />Restaurer</HeaderButton
				>
			{:else}
				<HeaderButton onclick={() => act.features.archive(feature.id, true)}
					><Archive size={14} />Archiver</HeaderButton
				>
			{/if}
			<HeaderButton onclick={remove} title="Supprimer (annulable quelques secondes)"
				><Trash2 size={14} /></HeaderButton
			>
		{/if}
	{/snippet}
</PageHeader>
{#if feature}
	{#if feature.archivedAt}
		<p class="border-b border-line bg-sunken px-6 py-2.5 text-ui text-ink-2">
			Archivée le {formatDay(feature.archivedAt, { day: 'numeric', month: 'long' })} : elle n’apparaît
			plus dans les listes, tout reste consultable ici.
		</p>
	{:else if finished}
		<p class="flex items-center gap-3 border-b border-line bg-accent-soft px-6 py-2.5 text-ui">
			Toutes les tâches sont faites. Tu peux la ranger : elle restera consultable.
			<button
				type="button"
				onclick={() => act.features.archive(feature.id, true)}
				class="font-medium text-accent-text hover:underline">Archiver la feature</button
			>
		</p>
	{/if}
	<Page width="max-w-[1320px]">
		<FeatureHeader {feature} />
		<div class="grid items-start gap-x-12 gap-y-8 lg:grid-cols-[minmax(0,1fr)_minmax(340px,420px)]">
			<div class="min-w-0">
				<Section title="Tâches"><FeatureTasks featureId={feature.id} /></Section>
				<Section title="C’est fini quand…">
					<InlineRichText
						value={feature.doneCriteria}
						resolve={refs.resolve}
						suggest={refs.suggest}
						placeholder="Les critères pour dire « c’est fini »"
						onsave={(doneCriteria) => act.features.update(feature.id, { doneCriteria })}
					/>
				</Section>
				<FeatureLinks featureId={feature.id} />
			</div>
			<aside class="min-w-0 lg:sticky lg:top-20">
				<Section title="Discussion">
					<div class="overflow-hidden rounded-xl border border-line bg-surface">
						<Thread featureId={feature.id} class="h-[min(640px,70vh)]" />
					</div>
				</Section>
			</aside>
		</div>
	</Page>
{:else}
	<Page>
		<EmptyState
			icon={FileQuestion}
			title="Feature introuvable"
			text="Elle a peut-être été supprimée."
		>
			<a href="{base}/tasks" class="font-medium text-accent-text hover:underline"
				>Retour à Gestion</a
			>
		</EmptyState>
	</Page>
{/if}
