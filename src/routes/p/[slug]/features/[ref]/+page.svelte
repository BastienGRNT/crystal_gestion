<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Archive, ArchiveRestore, FileQuestion, FolderOpen, Trash2 } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import { formatDay } from '$lib/client/format';
	import { featureColors } from '$lib/client/views/feature-colors';
	import { progressOf } from '$lib/modules/tasks/domain/progress';
	import Thread from '$lib/connected/discussion/Thread.svelte';
	import FeatureHeader from '$lib/connected/feature/FeatureHeader.svelte';
	import FeatureLinks from '$lib/connected/feature/FeatureLinks.svelte';
	import FeatureTasks from '$lib/connected/feature/FeatureTasks.svelte';
	import EmptyState from '$lib/ui/molecules/EmptyState.svelte';
	import HeaderButton from '$lib/ui/molecules/HeaderButton.svelte';
	import InlineRichText from '$lib/ui/molecules/InlineRichText.svelte';
	import InlineText from '$lib/ui/molecules/InlineText.svelte';
	import Section from '$lib/ui/molecules/Section.svelte';
	import Page from '$lib/ui/templates/Page.svelte';
	import PageHeader from '$lib/ui/templates/PageHeader.svelte';

	const { store, actions: act, refs } = useProject();
	const feature = $derived(store.features.items.find((f) => f.ref === page.params.ref));
	const base = $derived(`/p/${store.project.slug}`);
	const color = $derived(featureColors(store.features.items)(feature?.id));
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

<svelte:head><title>{feature?.title ?? 'Feat'} · {store.project.name}</title></svelte:head>

{#if feature}
	<PageHeader title={feature.title}>
		{#snippet lead()}<span class="size-5 shrink-0 rounded-[6px]" style="background:{color}"
			></span>{/snippet}
		{#snippet heading()}<InlineText
				value={feature.title}
				onsave={(title) => act.features.update(feature.id, { title })}
				class="text-3xl font-extrabold tracking-[-0.02em]"
			/>{/snippet}
		{#snippet actions()}
			<HeaderButton href="{base}/drive?feature={feature.ref}"
				><FolderOpen size={16} />Fichiers{files ? ` · ${files}` : ''}</HeaderButton
			>
			{#if feature.archivedAt}
				<HeaderButton onclick={() => act.features.archive(feature.id, false)}
					><ArchiveRestore size={16} />Restaurer</HeaderButton
				>
			{:else}
				<HeaderButton onclick={() => act.features.archive(feature.id, true)}
					><Archive size={16} />Archiver</HeaderButton
				>
			{/if}
			<HeaderButton onclick={remove} title="Supprimer (annulable quelques secondes)"
				><Trash2 size={16} /></HeaderButton
			>
		{/snippet}
	</PageHeader>
	<Page width="max-w-[1400px]">
		{#if feature.archivedAt}
			<p class="mb-6 rounded-[14px] bg-sunken px-5 py-3.5 text-[15px] text-ink-2">
				Archivée le {formatDay(feature.archivedAt, { day: 'numeric', month: 'long' })}. Elle
				n’apparaît plus dans les listes ; tout reste consultable ici et dans Gestion › Archives.
			</p>
		{:else if finished}
			<p
				class="mb-6 flex flex-wrap items-center gap-3 rounded-[14px] bg-accent-soft px-5 py-3.5 text-[15px]"
			>
				Toutes les Tasks sont faites. Range-la : elle restera consultable dans les Archives.
				<button
					type="button"
					onclick={() => act.features.archive(feature.id, true)}
					class="font-bold text-accent-text hover:underline">Archiver la Feat</button
				>
			</p>
		{/if}
		<FeatureHeader {feature} />
		<div class="grid items-start gap-x-10 gap-y-8 xl:grid-cols-[minmax(0,1fr)_minmax(380px,440px)]">
			<div class="min-w-0">
				<Section title="Tasks et Fix"><FeatureTasks featureId={feature.id} /></Section>
				<Section title="C’est fini quand…">
					<div class="rounded-[18px] border-[1.5px] border-line bg-surface px-5 py-4 text-[15px]">
						<InlineRichText
							value={feature.doneCriteria}
							resolve={refs.resolve}
							suggest={refs.suggest}
							placeholder="Les critères pour dire « c’est fini »"
							onsave={(doneCriteria) => act.features.update(feature.id, { doneCriteria })}
						/>
					</div>
				</Section>
				<FeatureLinks featureId={feature.id} />
			</div>
			<aside class="min-w-0 xl:sticky xl:top-6">
				<Section title="Discussion">
					<div class="overflow-hidden rounded-[18px] border-[1.5px] border-line bg-surface">
						<Thread featureId={feature.id} class="h-[min(680px,72vh)]" />
					</div>
				</Section>
			</aside>
		</div>
	</Page>
{:else}
	<PageHeader title="Feat introuvable" />
	<Page>
		<EmptyState icon={FileQuestion} title="Feat introuvable" text="Elle a peut-être été supprimée.">
			<a href="{base}/tasks" class="font-bold text-accent-text hover:underline">Retour à Gestion</a>
		</EmptyState>
	</Page>
{/if}
