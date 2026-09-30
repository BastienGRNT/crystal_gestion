<script lang="ts">
	import { enhance } from '$app/forms';
	import { ArrowLeft, ArrowRight } from '@lucide/svelte';
	import Button from '$lib/ui/atoms/Button.svelte';
	import Logo from '$lib/ui/atoms/Logo.svelte';
	import FormError from '$lib/ui/molecules/FormError.svelte';
	import NumberedField from '$lib/ui/molecules/NumberedField.svelte';
	import FramingFields from '$lib/ui/organisms/FramingFields.svelte';
	import TeamPicker from '$lib/ui/organisms/TeamPicker.svelte';

	let { data, form } = $props();
	let submitting = $state(false);
</script>

<svelte:head><title>Nouveau projet · Crystal</title></svelte:head>

<div class="mx-auto max-w-3xl px-5 py-10 sm:py-16">
	<header class="mb-12 flex items-center justify-between">
		<span class="flex items-center gap-2 font-semibold"><Logo /> Crystal</span>
		{#if data.hasProjects}
			<a href="/" class="flex items-center gap-1.5 text-sm text-ink-3 hover:text-ink"
				><ArrowLeft size={14} /> Retour</a
			>
		{/if}
	</header>
	<h1 class="font-display text-5xl leading-none italic sm:text-6xl">Nouveau projet</h1>
	<p class="mt-3 mb-10 max-w-md text-lg text-ink-2">
		Quelques questions, deux minutes. Canal, tableau et dossiers se créent tout seuls.
	</p>
	<form
		method="POST"
		use:enhance={() => {
			submitting = true;
			return async ({ update }) => {
				await update({ reset: false });
				submitting = false;
			};
		}}
	>
		<FormError message={form?.error} />
		<FramingFields values={form ?? {}} />
		<NumberedField index={7} label="L’équipe" hint="Tu pourras aussi inviter par lien juste après.">
			<TeamPicker people={data.others} />
		</NumberedField>
		<div class="flex justify-end border-t border-line pt-6">
			<Button type="submit" variant="primary" size="lg" loading={submitting}
				>Créer le projet <ArrowRight size={16} /></Button
			>
		</div>
	</form>
</div>
