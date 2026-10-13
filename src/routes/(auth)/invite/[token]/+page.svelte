<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import Button from '$lib/ui/atoms/Button.svelte';
	import AccountFields from '$lib/ui/organisms/AccountFields.svelte';
	import AuthForm from '$lib/ui/organisms/AuthForm.svelte';

	let { data, form } = $props();
	const values = $derived(form as { name?: string; email?: string; message?: string } | null);
</script>

<svelte:head><title>Invitation · Crystal</title></svelte:head>

{#if !data.invitation}
	<h1 class="text-xl font-semibold tracking-tight">Ce lien ne marche plus</h1>
	<p class="mt-2 text-md text-ink-3">
		Il a expiré (7 jours) ou a déjà servi. Demande un nouveau lien à la personne qui te l’a envoyé.
	</p>
	<Button href="/login" variant="secondary" size="lg" class="mt-6 w-full"
		>J’ai déjà un compte</Button
	>
{:else if data.signedInAs}
	<h1 class="text-xl font-semibold tracking-tight">Rejoindre « {data.invitation.projectName} »</h1>
	<p class="mt-2 text-md text-ink-3">
		{data.invitation.invitedBy} t’invite dans ce projet. Tu es connecté·e en tant que {data.signedInAs}.
	</p>
	<form method="POST" action="?/join" use:enhance class="mt-6 flex flex-col gap-3">
		{#if values?.message}<p class="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger-text">
				{values.message}
			</p>{/if}
		<Button type="submit" variant="primary" size="lg" class="w-full">Rejoindre le projet</Button>
	</form>
{:else}
	<AuthForm
		title="{data.invitation.invitedBy} t’invite sur « {data.invitation.projectName} »"
		intro="Crée ton compte pour rejoindre le projet."
		submit="Créer mon compte et rejoindre"
		action="?/register"
		message={values?.message}
	>
		<AccountFields name={values?.name} email={values?.email} />
	</AuthForm>
	<p class="mt-5 text-center text-sm text-ink-3">
		Déjà un compte ?
		<a
			class="font-medium text-accent-text hover:underline"
			href="/login?redirect={encodeURIComponent(page.url.pathname)}">Connecte-toi</a
		>
		puis rouvre ce lien.
	</p>
{/if}
