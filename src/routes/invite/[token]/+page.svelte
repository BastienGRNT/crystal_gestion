<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import Button from '$lib/ui/atoms/Button.svelte';
	import AccountForm from '$lib/ui/organisms/AccountForm.svelte';
	import AuthLayout from '$lib/ui/templates/AuthLayout.svelte';

	let { data, form } = $props();
</script>

<AuthLayout title="Tu es invité·e" subtitle="Rejoins « {data.projectName} » sur Crystal.">
	{#if data.user}
		<form method="POST" action="?/join" use:enhance>
			<Button type="submit" variant="primary" size="lg" class="w-full"
				>Rejoindre en tant que {data.user.name}</Button
			>
		</form>
	{:else}
		<AccountForm
			action="?/register"
			submitLabel="Créer mon compte et rejoindre"
			error={form?.error}
			values={form ?? {}}
		/>
		<p class="mt-6 text-center text-sm text-ink-3">
			Déjà un compte ?
			<a class="text-accent hover:underline" href="/login?redirect=/invite/{page.params.token}"
				>Se connecter</a
			>
		</p>
	{/if}
</AuthLayout>
