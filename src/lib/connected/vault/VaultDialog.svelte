<script lang="ts">
	import { Eye, EyeOff, Wand } from '@lucide/svelte';
	import { untrack } from 'svelte';
	import type { EntryForm } from '$lib/client/actions/vault';
	import { useApp } from '$lib/client/context';
	import Button from '$lib/ui/atoms/Button.svelte';
	import IconButton from '$lib/ui/atoms/IconButton.svelte';
	import TextArea from '$lib/ui/atoms/TextArea.svelte';
	import TextInput from '$lib/ui/atoms/TextInput.svelte';
	import Dialog from '$lib/ui/molecules/Dialog.svelte';
	import Field from '$lib/ui/molecules/Field.svelte';

	let {
		open = $bindable(),
		projectId,
		entryId
	}: { open: boolean; projectId: string; entryId?: string } = $props();
	const { app, actions } = useApp();
	const entry = $derived(app.vault.get(entryId));

	let form = $state<EntryForm>({ name: '', url: '', username: '', notes: '', secret: '' });
	let changingSecret = $state(true);
	let visible = $state(false);
	let saving = $state(false);

	$effect(() => {
		if (!open) return;
		untrack(() => {
			form = {
				name: entry?.name ?? '',
				url: entry?.url ?? '',
				username: entry?.username ?? '',
				notes: entry?.notes ?? '',
				secret: ''
			};
			changingSecret = !entry?.hasSecret;
			visible = false;
		});
	});

	/** 20 characters from an unambiguous alphabet: strong, and readable when typed by hand. */
	function generate() {
		const alphabet = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789-_!?';
		const bytes = crypto.getRandomValues(new Uint8Array(20));
		form.secret = [...bytes].map((b) => alphabet[b % alphabet.length]).join('');
		visible = true;
	}

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		saving = true;
		const fields = { ...form, secret: changingSecret ? form.secret : undefined };
		const saved = entry
			? await actions.vault.update(entry.id, fields)
			: await actions.vault.create(projectId, fields);
		saving = false;
		if (saved) open = false;
	}
</script>

<Dialog
	bind:open
	title={entry ? 'Modifier l’accès' : 'Nouvel accès'}
	description="Un compte partagé (hébergeur, Stripe, admin…) ou simplement un lien utile. Le mot de passe est chiffré."
>
	<form id="vault-form" class="flex flex-col gap-4" onsubmit={submit} autocomplete="off">
		<Field label="Nom" for="vault-name">
			<TextInput
				id="vault-name"
				bind:value={form.name}
				placeholder="Ex. : Stripe (prod)"
				required
				autofocus
				maxlength={80}
			/>
		</Field>
		<Field label="Lien" for="vault-url">
			<TextInput
				id="vault-url"
				bind:value={form.url}
				placeholder="dashboard.stripe.com"
				inputmode="url"
			/>
		</Field>
		<div class="grid gap-4 sm:grid-cols-2">
			<Field label="Identifiant" for="vault-user">
				<TextInput
					id="vault-user"
					bind:value={form.username}
					placeholder="email ou nom d’utilisateur"
					autocomplete="off"
				/>
			</Field>
			<Field label="Mot de passe" for="vault-secret">
				{#if changingSecret}
					<div class="flex gap-1">
						<TextInput
							id="vault-secret"
							bind:value={form.secret}
							type={visible ? 'text' : 'password'}
							autocomplete="new-password"
							placeholder={entry?.hasSecret ? 'Nouveau (vide = le retirer)' : 'Facultatif'}
							class="font-mono"
						/>
						<IconButton
							icon={visible ? EyeOff : Eye}
							label={visible ? 'Masquer' : 'Afficher'}
							onclick={() => (visible = !visible)}
						/>
						<IconButton icon={Wand} label="Générer un mot de passe solide" onclick={generate} />
					</div>
				{:else}
					<Button variant="secondary" class="w-full" onclick={() => (changingSecret = true)}
						>Changer le mot de passe</Button
					>
				{/if}
			</Field>
		</div>
		<Field label="Note" for="vault-notes">
			<TextArea
				id="vault-notes"
				bind:value={form.notes}
				placeholder="2FA sur le téléphone d’Ana, compte de facturation…"
				maxlength={2000}
			/>
		</Field>
	</form>
	{#snippet footer()}
		<Button variant="ghost" onclick={() => (open = false)}>Annuler</Button>
		<Button type="submit" form="vault-form" variant="primary" loading={saving}
			>{entry ? 'Enregistrer' : 'Ajouter'}</Button
		>
	{/snippet}
</Dialog>
