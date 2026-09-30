<script lang="ts">
	import { BookOpen, Gem, Sparkles } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import Tabs from '$lib/ui/molecules/Tabs.svelte';

	let { value }: { value: 'overview' | 'journal' | 'ai' } = $props();
	const { store } = useProject();
	const base = $derived(`/p/${store.project.slug}`);
</script>

<div class="mb-8">
	<Tabs
		label="Sections du projet"
		{value}
		tabs={[
			{
				value: 'overview',
				label: 'Vue d’ensemble',
				short: 'Projet',
				href: `${base}/project`,
				icon: Gem
			},
			{
				value: 'journal',
				label: 'Journal des décisions',
				short: 'Journal',
				href: `${base}/journal`,
				icon: BookOpen,
				count: store.journal.items.length
			},
			{
				value: 'ai',
				label: 'Mémoire IA',
				short: 'IA',
				href: `${base}/ai`,
				icon: Sparkles,
				count: store.aiNotes.items.length
			}
		]}
	/>
</div>
