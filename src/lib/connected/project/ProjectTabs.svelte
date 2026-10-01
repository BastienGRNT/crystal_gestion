<script lang="ts">
	import { useProject } from '$lib/client/context';
	import LinkSegments from '$lib/ui/molecules/LinkSegments.svelte';

	let { value }: { value: 'features' | 'journal' | 'overview' | 'ai' } = $props();
	const { store } = useProject();
	const base = $derived(`/p/${store.project.slug}`);
</script>

<LinkSegments
	label="Sections du projet"
	{value}
	tabs={[
		{ value: 'features', label: 'Features', href: `${base}/features` },
		{ value: 'journal', label: 'Journal', href: `${base}/journal` },
		{ value: 'overview', label: 'Le projet', href: `${base}/project` },
		{ value: 'ai', label: 'Mémoire IA', href: `${base}/ai` }
	]}
/>
