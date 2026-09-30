<script lang="ts">
	import { page } from '$app/state';
	import { useProject } from '$lib/client/context';
	import Thread from '$lib/connected/discussion/Thread.svelte';
	import { threadLinks } from '$lib/connected/discussion/thread-links';
	import ThreadList from '$lib/ui/molecules/ThreadList.svelte';
	import ThreadTabs from '$lib/ui/molecules/ThreadTabs.svelte';
	import ThreadHeader from '$lib/ui/organisms/ThreadHeader.svelte';
	import MissingThread from './MissingThread.svelte';

	const { store } = useProject();
	const slug = $derived(store.project.slug);
	const ref = $derived(page.params.thread ?? null);
	const feature = $derived(ref ? store.features.items.find((f) => f.ref === ref) : undefined);
	const threads = $derived(threadLinks(store.features.items, slug, ref));
	const featureLink = $derived(
		feature && {
			ref: feature.ref,
			priority: feature.priority,
			href: `/p/${slug}/features/${feature.ref}`
		}
	);
</script>

<svelte:head><title>{feature?.title ?? 'Général'} · {store.project.name}</title></svelte:head>

<div class="flex h-full min-h-0">
	<aside class="hidden w-64 shrink-0 overflow-y-auto border-r border-line px-3 pt-8 pb-6 md:block">
		<p class="mb-2 px-2.5 text-2xs font-semibold tracking-[0.08em] text-ink-3 uppercase">
			Fils de discussion
		</p>
		<ThreadList {threads} />
	</aside>
	<section
		class="flex min-w-0 flex-1 flex-col pb-[calc(3.6rem+env(safe-area-inset-bottom))] md:pb-0"
	>
		<div class="border-b border-line px-4 pt-4 pb-3 sm:px-6 md:pt-12 md:pb-4">
			<ThreadHeader title={feature?.title ?? 'Général'} feature={featureLink} />
			<div class="mt-3 md:hidden"><ThreadTabs {threads} /></div>
		</div>
		{#if ref && !feature}
			<MissingThread href="/p/{slug}/discussion" />
		{:else}
			{#key feature?.id}<Thread featureId={feature?.id ?? null} class="flex-1" />{/key}
		{/if}
	</section>
</div>
