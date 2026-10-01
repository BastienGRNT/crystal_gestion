<script lang="ts">
	import { useProject } from '$lib/client/context';
	import QuickCreate from '$lib/ui/organisms/QuickCreate.svelte';
	import FeatQuestion from './FeatQuestion.svelte';

	let { open = $bindable(false) }: { open?: boolean } = $props();
	const { actions } = useProject();
	let featureId = $state<string | null>(null);

	const create = (values: Record<string, string>) =>
		actions.resources
			.createLink({ ...values, title: values.title, featureId })
			.then(() => (featureId = null));
</script>

<QuickCreate
	bind:open
	label="Ajouter un lien"
	fields={[
		{ key: 'title', label: 'Titre', placeholder: 'Titre — Maquettes Figma, Repo…' },
		{ key: 'url', label: 'URL', type: 'url', mono: true, placeholder: 'https://…' },
		{ key: 'tag', label: 'Tags', placeholder: 'Tags, séparés par des virgules' }
	]}
	onsubmit={create}
>
	{#snippet extra()}<FeatQuestion value={featureId} onchange={(id) => (featureId = id)} />{/snippet}
</QuickCreate>
