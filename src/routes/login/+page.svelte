<script lang="ts">
	import AccountForm from '$lib/ui/organisms/AccountForm.svelte';
	import AuthLayout from '$lib/ui/templates/AuthLayout.svelte';

	let { form } = $props();
</script>

<AuthLayout
	title="Content de te revoir"
	subtitle="Connecte-toi pour reprendre là où tu t’étais arrêté."
>
	<AccountForm
		submitLabel="Se connecter"
		withName={false}
		error={form?.error}
		values={form ?? {}}
	/>
</AuthLayout>
