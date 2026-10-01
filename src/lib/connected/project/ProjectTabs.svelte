<script lang="ts">
	import { useProject } from '$lib/client/context';
	import LinkSegments from '$lib/ui/molecules/LinkSegments.svelte';

	let { value }: { value: 'journal' | 'overview' | 'ai' } = $props();
	const { store } = useProject();
	const base = $derived(`/p/${store.project.slug}`);
</script>

<LinkSegments
	label="Sections du projet"
	{value}
	tabs={[
		{ value: 'overview', label: 'Objectif et équipe', href: `${base}/project` },
		{ value: 'journal', label: 'Journal', href: `${base}/journal` },
		{ value: 'ai', label: 'Mémoire IA', href: `${base}/ai` }
	]}
/>
