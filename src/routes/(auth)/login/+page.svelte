<script lang="ts">
	import TextInput from '$lib/ui/atoms/TextInput.svelte';
	import Field from '$lib/ui/molecules/Field.svelte';
	import AuthForm from '$lib/ui/organisms/AuthForm.svelte';

	let { form } = $props();
</script>

<svelte:head><title>Connexion · Crystal</title></svelte:head>

<AuthForm title="Content de te revoir" submit="Se connecter" message={form?.message}>
	<Field label="Email" for="email">
		<TextInput
			id="email"
			name="email"
			type="email"
			value={form?.email ?? ''}
			autocomplete="email"
			required
			autofocus
		/>
	</Field>
	<Field label="Mot de passe" for="password">
		<TextInput
			id="password"
			name="password"
			type="password"
			autocomplete="current-password"
			required
		/>
	</Field>
</AuthForm>
<p class="mt-5 text-center text-sm text-ink-3">
	Pas encore de compte ? Demande un lien d’invitation à ton équipe.
</p>
