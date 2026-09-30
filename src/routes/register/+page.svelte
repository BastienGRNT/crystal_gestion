<script lang="ts">
	import Button from '$lib/ui/atoms/Button.svelte';
	import Input from '$lib/ui/atoms/Input.svelte';
	import Field from '$lib/ui/molecules/Field.svelte';
	import AccountForm from '$lib/ui/organisms/AccountForm.svelte';
	import AuthLayout from '$lib/ui/templates/AuthLayout.svelte';

	let { data, form } = $props();
</script>

<AuthLayout
	title="Créer ton compte"
	subtitle="Crystal est privé : il te faut un lien d’invitation ou le code d’accès."
>
	<form method="GET" class="flex items-end gap-2">
		<div class="flex-1">
			<Field label="Lien d’invitation">
				<Input name="invite" placeholder="Colle le lien reçu" autocomplete="off" />
			</Field>
		</div>
		<Button type="submit" size="lg">Continuer</Button>
	</form>
	{#if data.codeEnabled}
		<p class="my-6 flex items-center gap-3 text-sm text-ink-3">
			<span class="h-px flex-1 bg-line"></span>ou avec le code d’accès<span
				class="h-px flex-1 bg-line"
			></span>
		</p>
		<AccountForm submitLabel="Créer mon compte" error={form?.error} values={form ?? {}}>
			<Field label="Code d’accès" hint="Donné par un membre de l’équipe">
				<Input name="code" required autocomplete="off" />
			</Field>
		</AccountForm>
	{:else}
		<p class="mt-6 text-base text-ink-2">
			Pas de lien ? Demande à un membre du projet de t’en créer un depuis la page <strong
				>Projet → Équipe</strong
			>.
		</p>
	{/if}
	<p class="mt-8 text-center text-sm text-ink-3">
		Déjà un compte ? <a class="font-medium text-accent hover:underline" href="/login"
			>Se connecter</a
		>
	</p>
</AuthLayout>
