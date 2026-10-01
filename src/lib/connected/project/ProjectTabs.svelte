<script lang="ts">
	import { BookOpen, Target } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import PageTabs from '$lib/ui/molecules/PageTabs.svelte';

	let { value }: { value: 'journal' | 'overview' | 'ai' } = $props();
	const { store } = useProject();
	const base = $derived(`/p/${store.project.slug}`);
</script>

<PageTabs
	label="Sections du projet"
	{value}
	tabs={[
		{ value: 'overview', label: 'Objectif et équipe', icon: Target, href: `${base}/project` },
		{
			value: 'journal',
			label: 'Décisions',
			icon: BookOpen,
			href: `${base}/journal`,
			count: store.journal.items.length
		}
	]}
/>
