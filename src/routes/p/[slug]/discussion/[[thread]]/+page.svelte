<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { useProject } from '$lib/client/context';
	import Thread from '$lib/connected/discussion/Thread.svelte';
	import { threadLinks } from '$lib/connected/discussion/thread-links';
	import InlineCreate from '$lib/ui/molecules/InlineCreate.svelte';
	import ThreadList from '$lib/ui/molecules/ThreadList.svelte';
	import ThreadTabs from '$lib/ui/molecules/ThreadTabs.svelte';
	import ThreadHeader from '$lib/ui/organisms/ThreadHeader.svelte';
	import MissingThread from './MissingThread.svelte';

	const { store, actions } = useProject();
	const slug = $derived(store.project.slug);
	const base = $derived(`/p/${slug}/discussion`);
	// The segment is a feature ref (F-3) or a channel id.
	const param = $derived(page.params.thread ?? null);
	const feature = $derived(param ? store.features.items.find((f) => f.ref === param) : undefined);
	const channel = $derived(param ? store.channels.get(param) : undefined);
	const links = $derived(threadLinks(store.features.items, store.channels.items, slug, param));
	const featureLink = $derived(
		feature && {
			ref: feature.ref,
			href: `/p/${slug}/features/${feature.ref}`
		}
	);
	const channelTools = $derived(
		channel && {
			onrename: (name: string) => actions.channels.rename(channel.id, name),
			ondelete: () => (actions.channels.remove(channel.id), goto(base))
		}
	);

	async function create(name: string) {
		const created = await actions.channels.create(name);
		if (created) goto(`${base}/${created.id}`);
	}
</script>

<svelte:head
	><title>{feature?.title ?? channel?.name ?? 'Général'} · {store.project.name}</title></svelte:head
>

<!-- Fills the page card: the thread scrolls, not the page. -->
<div class="flex min-h-0 flex-1 max-md:h-dvh">
	<aside
		class="hidden w-72 shrink-0 overflow-y-auto border-r-[1.5px] border-line bg-surface-2 px-3 py-6 md:block"
	>
		<h1 class="mb-4 px-3 text-2xl font-extrabold tracking-[-0.02em]">Discussion</h1>
		<ThreadList team={links.team} features={links.features} oncreate={create} />
	</aside>
	<section
		class="flex min-w-0 flex-1 flex-col pb-[calc(3.6rem+env(safe-area-inset-bottom))] md:pb-0"
	>
		<div
			class="flex min-h-[72px] shrink-0 flex-col justify-center border-b-[1.5px] border-line px-5 py-3 sm:px-8"
		>
			<ThreadHeader
				title={feature?.title ?? channel?.name ?? 'Général'}
				feature={featureLink}
				channel={channelTools}
			/>
			<div class="mt-3 md:hidden"><ThreadTabs threads={[...links.team, ...links.features]} /></div>
			<div class="mt-1 md:hidden">
				<InlineCreate
					label="Nouveau canal"
					placeholder="Nom du canal, puis Entrée"
					oncreate={create}
				/>
			</div>
		</div>
		{#if param && !feature && !channel}
			<MissingThread href={base} />
		{:else}
			{#key param}<Thread
					featureId={feature?.id ?? null}
					channelId={channel?.id ?? null}
					class="flex-1"
				/>{/key}
		{/if}
	</section>
</div>
