<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '../atoms/Button.svelte';
	import Input from '../atoms/Input.svelte';
	import Field from '../molecules/Field.svelte';
	import FormError from '../molecules/FormError.svelte';

	interface Props {
		submitLabel: string;
		action?: string;
		withName?: boolean;
		error?: string | null;
		values?: { name?: string; email?: string };
	}

	let { submitLabel, action, withName = true, error, values = {} }: Props = $props();
	let submitting = $state(false);
</script>

<form
	method="POST"
	{action}
	class="flex flex-col gap-4"
	use:enhance={() => {
		submitting = true;
		return async ({ update }) => {
			await update({ reset: false });
			submitting = false;
		};
	}}
>
	<FormError message={error} />
	{#if withName}
		<Field label="Ton prénom"
			><Input name="name" required autocomplete="given-name" value={values.name ?? ''} /></Field
		>
	{/if}
	<Field label="Email"
		><Input
			name="email"
			type="email"
			required
			autocomplete="email"
			value={values.email ?? ''}
		/></Field
	>
	<Field label="Mot de passe" hint={withName ? '8 caractères minimum' : undefined}>
		<Input
			name="password"
			type="password"
			required
			autocomplete={withName ? 'new-password' : 'current-password'}
		/>
	</Field>
	<Button type="submit" variant="primary" size="lg" loading={submitting} class="mt-2"
		>{submitLabel}</Button
	>
</form>
