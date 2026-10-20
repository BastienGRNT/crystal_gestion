<script lang="ts">
	import { ClipboardCopy } from '@lucide/svelte';
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import { useApp } from '$lib/client/context';
	import { toasts } from '$lib/client/toasts.svelte';
	import { functionalSpecMarkdown, techSpecMarkdown } from '$lib/client/views/framing';
	import { currentProject } from '$lib/connected/projects/current.svelte';
	import { framedOf, framingNoteMarkdown } from '$lib/connected/framing/framed';
	import Button from '$lib/ui/atoms/Button.svelte';
	import Tabs from '$lib/ui/molecules/Tabs.svelte';
	import PageHeader from '$lib/ui/organisms/PageHeader.svelte';

	let { children }: { children: Snippet } = $props();
	const { app } = useApp();
	const project = $derived(currentProject(app));
	const base = $derived(project ? `/p/${project.slug}/cadrage` : '');
	const path = $derived(page.url.pathname);
	const doc = $derived(
		path.endsWith('/fonctionnel') ? 'functional' : path.endsWith('/technique') ? 'tech' : 'note'
	);

	/** The document as Markdown, ready to paste in a mail or a shared drive. */
	async function exportDoc() {
		if (!project) return;
		const framed = framedOf(app, project);
		const text =
			doc === 'functional'
				? functionalSpecMarkdown(framed)
				: doc === 'tech'
					? techSpecMarkdown(project)
					: framingNoteMarkdown(app, framed);
		await navigator.clipboard.writeText(text).catch(() => {});
		toasts.show('Document copié en Markdown : colle-le où tu veux.', { tone: 'success' });
	}
</script>

<svelte:head><title>Comprendre le projet · {project?.name ?? ''} · Crystal</title></svelte:head>

{#if project}
	<PageHeader
		title="Comprendre le projet"
		subtitle="Ce qu’on fait, pour qui et comment : à relire quand on doute, et à donner à lire à qui arrive. Le travail de chaque jour reste dans le tableau."
	>
		{#snippet actions()}
			<Button icon={ClipboardCopy} onclick={exportDoc}>Exporter</Button>
		{/snippet}
		{#snippet tabs()}
			<Tabs
				label="Documents du projet"
				tabs={[
					{ href: base, label: 'Note de cadrage', active: doc === 'note' },
					{
						href: `${base}/fonctionnel`,
						label: 'Cahier des charges fonctionnel',
						active: doc === 'functional'
					},
					{
						href: `${base}/technique`,
						label: 'Cahier des charges technique',
						active: doc === 'tech'
					}
				]}
			/>
		{/snippet}
	</PageHeader>
	<div class="mx-auto max-w-[1240px] px-4 pt-6 pb-16 sm:px-8">
		{@render children()}
	</div>
{/if}
