<script lang="ts">
	import { untrack } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { BookOpen, Wrench } from '@lucide/svelte';
	import { isDraftKind, type DraftKind } from '$lib/client/views/journal-draft';
	import JournalBrowser from '$lib/connected/journal/JournalBrowser.svelte';
	import JournalComposer from '$lib/connected/journal/JournalComposer.svelte';
	import ProjectTabs from '$lib/connected/project/ProjectTabs.svelte';
	import Button from '$lib/ui/atoms/Button.svelte';
	import Page from '$lib/ui/templates/Page.svelte';
	import PageHeader from '$lib/ui/templates/PageHeader.svelte';

	let composing = $state<{ kind: DraftKind; title: string; key: number } | null>(null);
	const compose = (kind: DraftKind, title = '') => (composing = { kind, title, key: Date.now() });

	// `?new=decision&title=…` (from Cmd+K) opens the composer once, then leaves a clean URL.
	$effect(() => {
		const kind = page.url.searchParams.get('new');
		if (!isDraftKind(kind)) return;
		const url = new URL(page.url);
		untrack(() => compose(kind, url.searchParams.get('title') ?? ''));
		url.searchParams.delete('new');
		url.searchParams.delete('title');
		goto(url, { replaceState: true, keepFocus: true, noScroll: true });
	});
</script>

<svelte:head><title>Journal · Crystal</title></svelte:head>

<Page width="max-w-6xl">
	<PageHeader
		eyebrow="Projet"
		title="Journal"
		subtitle="Pourquoi le projet est comme il est : décisions prises, bugs résolus, changements de périmètre."
	>
		{#snippet actions()}
			<Button variant="primary" onclick={() => compose('decision')}
				><BookOpen size={14} /> Nouvelle décision</Button
			>
			<Button onclick={() => compose('fix')}><Wrench size={14} /> Noter un bug résolu</Button>
		{/snippet}
	</PageHeader>
	<ProjectTabs value="journal" />
	{#if composing}
		{#key composing.key}
			<div class="mb-8">
				<JournalComposer
					kind={composing.kind}
					title={composing.title}
					onclose={() => (composing = null)}
				/>
			</div>
		{/key}
	{/if}
	<JournalBrowser oncompose={compose} />
</Page>
