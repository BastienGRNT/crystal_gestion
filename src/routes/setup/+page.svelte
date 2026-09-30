<script lang="ts">
	import AccountForm from '$lib/ui/organisms/AccountForm.svelte';
	import AuthLayout from '$lib/ui/templates/AuthLayout.svelte';

	let { form } = $props();
</script>

<AuthLayout title="Bienvenue" subtitle="Crée le premier compte. Tu inviteras ton équipe ensuite.">
	<AccountForm submitLabel="Créer mon compte" error={form?.error} values={form ?? {}} />
</AuthLayout>
