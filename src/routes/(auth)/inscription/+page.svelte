<script lang="ts">
	import { page } from '$app/state';
	import AccountFields from '$lib/ui/organisms/AccountFields.svelte';
	import AuthForm from '$lib/ui/organisms/AuthForm.svelte';
	import AuthSwitch from '$lib/ui/organisms/AuthSwitch.svelte';

	let { form } = $props();
</script>

<svelte:head><title>Créer un compte · Crystal</title></svelte:head>

<AuthForm
	title="Créer ton compte"
	intro="Ensuite tu crées un projet, ou tu ouvres le lien d’invitation de ton équipe."
	submit="Créer mon compte"
	message={form?.message}
>
	<AccountFields name={form?.name} email={form?.email} />
</AuthForm>
<AuthSwitch question="Déjà un compte ?" label="Se connecter" href="/login{page.url.search}" />
