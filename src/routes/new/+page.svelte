<script lang="ts">
	import { enhance } from '$app/forms';
	import { ArrowLeft, ArrowRight } from '@lucide/svelte';
	import Avatar from '$lib/ui/atoms/Avatar.svelte';
	import Button from '$lib/ui/atoms/Button.svelte';
	import Input from '$lib/ui/atoms/Input.svelte';
	import Logo from '$lib/ui/atoms/Logo.svelte';
	import TextArea from '$lib/ui/atoms/TextArea.svelte';
	import FormError from '$lib/ui/molecules/FormError.svelte';
	import NumberedField from '$lib/ui/molecules/NumberedField.svelte';
	import ToggleChip from '$lib/ui/molecules/ToggleChip.svelte';

	let { data, form } = $props();
	let members = $state<string[]>([]);
	let submitting = $state(false);
	const toggle = (id: string) =>
		(members = members.includes(id) ? members.filter((m) => m !== id) : [...members, id]);
</script>

<svelte:head><title>Nouveau projet · Crystal</title></svelte:head>

<div class="mx-auto max-w-3xl px-5 py-10 sm:py-16">
	<header class="mb-12 flex items-center justify-between">
		<span class="flex items-center gap-2 font-semibold"><Logo /> Crystal</span>
		{#if data.hasProjects}
			<a href="/" class="flex items-center gap-1.5 text-[13px] text-ink-3 hover:text-ink"
				><ArrowLeft size={14} /> Retour</a
			>
		{/if}
	</header>
	<h1 class="font-display text-[56px] leading-none italic sm:text-[72px]">Nouveau projet</h1>
	<p class="mt-3 mb-10 max-w-md text-[15px] text-ink-2">
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
		<NumberedField index={1} label="Nom du projet">
			<Input
				name="name"
				required
				maxlength={120}
				value={form?.name ?? ''}
				placeholder="Ex. Atelier Pixel"
				class="h-11 text-[16px]"
			/>
		</NumberedField>
		<NumberedField index={2} label="L’objectif" hint="En une phrase.">
			<Input name="objective" value={form?.objective ?? ''} placeholder="Aider les … à … sans …" />
		</NumberedField>
		<NumberedField index={3} label="Pour qui ?" hint="La cible, les utilisateurs.">
			<Input name="audience" value={form?.audience ?? ''} />
		</NumberedField>
		<NumberedField index={4} label="Date limite" hint="Optionnelle.">
			<Input name="deadline" type="date" value={form?.deadline ?? ''} class="w-auto" />
		</NumberedField>
		<NumberedField index={5} label="Hors périmètre" hint="Ce qu’on ne fera pas.">
			<TextArea name="outOfScope" value={form?.outOfScope ?? ''} />
		</NumberedField>
		<NumberedField index={6} label="C’est fini quand…" hint="Ta définition de « fini ».">
			<TextArea name="doneDefinition" value={form?.doneDefinition ?? ''} />
		</NumberedField>
		<NumberedField index={7} label="L’équipe" hint="Tu pourras aussi inviter par lien juste après.">
			{#each members as id (id)}<input type="hidden" name="members" value={id} />{/each}
			<div class="flex flex-wrap gap-2">
				{#each data.others as user (user.id)}
					<ToggleChip pressed={members.includes(user.id)} onclick={() => toggle(user.id)}>
						<Avatar name={user.name} color={user.color} size={20} />{user.name}
					</ToggleChip>
				{:else}
					<p class="pt-1.5 text-[13px] text-ink-3">Personne d’autre pour l’instant.</p>
				{/each}
			</div>
		</NumberedField>
		<div class="flex justify-end border-t border-line pt-6">
			<Button type="submit" variant="primary" size="lg" loading={submitting}
				>Créer le projet <ArrowRight size={16} /></Button
			>
		</div>
	</form>
</div>
