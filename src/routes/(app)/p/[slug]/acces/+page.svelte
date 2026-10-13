<script lang="ts">
	import { Plus } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import { currentProject } from '$lib/connected/projects/current.svelte';
	import VaultView from '$lib/connected/vault/VaultView.svelte';
	import Button from '$lib/ui/atoms/Button.svelte';
	import PageHeader from '$lib/ui/organisms/PageHeader.svelte';

	const { app, overlays } = useApp();
	const project = $derived(currentProject(app));
</script>

<svelte:head><title>Accès · {project?.name ?? ''} · Crystal</title></svelte:head>

{#if project}
	<PageHeader
		title="Accès"
		subtitle="Les comptes et liens du projet : hébergeur, base, Stripe, comptes de test… Mots de passe chiffrés, copiés en un clic."
	>
		{#snippet actions()}
			<Button
				variant="primary"
				icon={Plus}
				onclick={() => (overlays.create = { kind: 'vault', projectId: project.id })}
				>Ajouter un accès</Button
			>
		{/snippet}
	</PageHeader>
	<div class="mx-auto max-w-[1440px] px-4 pb-12 sm:px-8"><VaultView {project} /></div>
{/if}
