<script lang="ts">
	import { Monitor, Moon, Sun } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import { applyTheme, storedTheme, type ThemeChoice } from '$lib/client/theme';
	import Avatar from '$lib/ui/atoms/Avatar.svelte';
	import Button from '$lib/ui/atoms/Button.svelte';
	import ColorPicker from '$lib/ui/atoms/ColorPicker.svelte';
	import Kbd from '$lib/ui/atoms/Kbd.svelte';
	import TextInput from '$lib/ui/atoms/TextInput.svelte';
	import Field from '$lib/ui/molecules/Field.svelte';
	import Segmented from '$lib/ui/molecules/Segmented.svelte';
	import PageHeader from '$lib/ui/organisms/PageHeader.svelte';
	import SettingsSection from '$lib/ui/organisms/SettingsSection.svelte';

	const { app, actions } = useApp();
	let theme = $state<ThemeChoice>(storedTheme());
	let name = $state(app.me.name);
	let current = $state('');
	let next = $state('');
	let saving = $state(false);

	const shortcuts = [
		{ keys: '⌘K', label: 'Chercher n’importe quoi (Ctrl+K sur Windows)' },
		{ keys: 'N', label: 'Nouvelle tâche dans le projet ouvert' },
		{ keys: 'I', label: 'Noter une idée' },
		{ keys: 'Échap', label: 'Fermer une fenêtre, annuler un glisser' }
	];

	async function changePassword(event: SubmitEvent) {
		event.preventDefault();
		saving = true;
		if (await actions.people.changePassword(current, next)) current = next = '';
		saving = false;
	}
</script>

<svelte:head><title>Mon compte · Crystal</title></svelte:head>

<PageHeader title="Mon compte" subtitle="Ton profil, ton mot de passe et l’apparence." />

<div class="mx-auto max-w-[1000px] px-4 pb-12 sm:px-8">
	<SettingsSection title="Profil" text="Comment les autres te voient.">
		<div class="flex flex-col gap-5">
			<div class="flex items-center gap-4">
				<Avatar name={app.me.name} color={app.me.color} size="lg" />
				<p class="text-base text-ink-3">{app.me.email}</p>
			</div>
			<form
				class="flex flex-wrap items-end gap-3"
				onsubmit={(e) => (e.preventDefault(), actions.people.updateMe({ name }))}
			>
				<div class="min-w-60 flex-1">
					<Field label="Ton nom" for="me-name"
						><TextInput id="me-name" bind:value={name} required maxlength={60} /></Field
					>
				</div>
				<Button type="submit" disabled={name.trim() === app.me.name}>Enregistrer</Button>
			</form>
			<Field label="Ta couleur"
				><ColorPicker
					value={app.me.color}
					onchange={(color) => actions.people.updateMe({ color })}
				/></Field
			>
		</div>
	</SettingsSection>

	<SettingsSection
		title="Mot de passe"
		text="Changer de mot de passe déconnecte tes autres appareils."
	>
		<form class="flex flex-col gap-4" onsubmit={changePassword}>
			<div class="grid gap-4 sm:grid-cols-2">
				<Field label="Mot de passe actuel" for="pw-current"
					><TextInput
						id="pw-current"
						type="password"
						bind:value={current}
						autocomplete="current-password"
						required
					/></Field
				>
				<Field label="Nouveau mot de passe" for="pw-next" hint="8 caractères minimum.">
					<TextInput
						id="pw-next"
						type="password"
						bind:value={next}
						autocomplete="new-password"
						minlength={8}
						required
					/>
				</Field>
			</div>
			<Button type="submit" class="self-start" loading={saving}>Changer le mot de passe</Button>
		</form>
	</SettingsSection>

	<SettingsSection title="Apparence" text="Mémorisée sur cet appareil.">
		<Segmented
			label="Thème"
			value={theme}
			onchange={(value) => ((theme = value), applyTheme(value))}
			options={[
				{ value: 'system', label: 'Comme l’appareil', icon: Monitor },
				{ value: 'light', label: 'Clair', icon: Sun },
				{ value: 'dark', label: 'Sombre', icon: Moon }
			]}
		/>
	</SettingsSection>

	<SettingsSection title="Raccourcis" text="Pour aller plus vite au clavier.">
		<ul class="flex flex-col gap-3">
			{#each shortcuts as shortcut (shortcut.keys)}
				<li class="flex items-center gap-3 text-base">
					<span class="w-16"><Kbd keys={shortcut.keys} /></span>{shortcut.label}
				</li>
			{/each}
		</ul>
	</SettingsSection>
</div>
