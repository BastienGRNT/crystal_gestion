<script lang="ts">
	import TextInput from '../atoms/TextInput.svelte';
	import Field from '../molecules/Field.svelte';

	let { name = '', email = '' }: { name?: string; email?: string } = $props();
</script>

<Field label="Ton prénom (ou ton nom)" for="name">
	<TextInput id="name" name="name" value={name} autocomplete="name" required autofocus />
</Field>
<Field label="Email" for="email">
	<TextInput id="email" name="email" type="email" value={email} autocomplete="email" required />
</Field>
<Field label="Mot de passe" for="password" hint="8 caractères minimum.">
	<TextInput
		id="password"
		name="password"
		type="password"
		autocomplete="new-password"
		minlength={8}
		required
	/>
</Field>
