<script lang="ts">
	import { useProject } from '$lib/client/context';
	import QuickCreate from '$lib/ui/organisms/QuickCreate.svelte';
	import FeatureChip from './FeatureChip.svelte';

	let { open = $bindable(false) }: { open?: boolean } = $props();
	const { actions } = useProject();
	let featureId = $state<string | null>(null);

	const create = (values: Record<string, string>) =>
		actions.resources
			.createAccount({ ...values, title: values.title, featureId })
			.then(() => (featureId = null));
</script>

<QuickCreate
	bind:open
	label="Nouveau compte partagé"
	fields={[
		{ key: 'title', label: 'Service', placeholder: 'Service — Stripe, OVH, Vercel…' },
		{ key: 'login', label: 'Identifiant', mono: true },
		{ key: 'secret', label: 'Mot de passe', type: 'password', mono: true },
		{ key: 'url', label: 'URL de connexion', type: 'url', wide: true },
		{ key: 'notes', label: 'Notes', placeholder: 'Notes — 2FA sur le téléphone de…', wide: true }
	]}
	onsubmit={create}
>
	{#snippet extra()}<FeatureChip value={featureId} onchange={(id) => (featureId = id)} />{/snippet}
</QuickCreate>
