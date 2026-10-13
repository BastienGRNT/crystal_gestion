<script lang="ts">
	import AccountFields from '$lib/ui/organisms/AccountFields.svelte';
	import AuthForm from '$lib/ui/organisms/AuthForm.svelte';

	let { form } = $props();
</script>

<svelte:head><title>Bienvenue · Crystal</title></svelte:head>

<AuthForm
	title="Bienvenue sur Crystal"
	intro="Crée le premier compte. Tu pourras inviter ton équipe juste après."
	submit="Créer mon compte"
	message={form?.message}
>
	<AccountFields name={form?.name} email={form?.email} />
</AuthForm>
