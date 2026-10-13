<script lang="ts">
	import { page } from '$app/state';
	import TextInput from '$lib/ui/atoms/TextInput.svelte';
	import Field from '$lib/ui/molecules/Field.svelte';
	import AuthForm from '$lib/ui/organisms/AuthForm.svelte';
	import AuthSwitch from '$lib/ui/organisms/AuthSwitch.svelte';

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
<AuthSwitch
	question="Pas encore de compte ?"
	label="Créer un compte"
	href="/inscription{page.url.search}"
/>
