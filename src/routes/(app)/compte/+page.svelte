<script lang="ts">
	import { Bell, BellOff, Monitor, Moon, Sun, Users } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import { desktopAlerts } from '$lib/client/desktop-alerts.svelte';
	import { applyTheme, storedTheme, type ThemeChoice } from '$lib/client/theme';
	import type { AlertLevel } from '$lib/client/views/alerts';
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

	const ALERT_HINTS: Record<AlertLevel, string> = {
		off: 'Choisis de quoi être prévenu : le navigateur te demandera ton accord.',
		mine: 'Tâches qu’on te confie, mentions, relectures demandées et réponses à tes questions.',
		all: 'Ce qui te concerne, plus les messages et l’avancement de toute l’équipe.'
	};
	const chooseAlerts = (level: AlertLevel) =>
		level === 'off' ? desktopAlerts.choose('off') : desktopAlerts.enable(level);

	async function changePassword(event: SubmitEvent) {
		event.preventDefault();
		saving = true;
		if (await actions.people.changePassword(current, next)) current = next = '';
		saving = false;
	}
</script>

<svelte:head><title>Mon compte · Crystal</title></svelte:head>

<PageHeader
	title="Mon compte"
	subtitle="Ton profil, ton mot de passe, les notifications et l’apparence."
/>

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

	<SettingsSection
		title="Notifications"
		text="Sur cet appareil, quand Crystal est ouvert dans un onglet que tu ne regardes pas."
	>
		{#if desktopAlerts.permission === 'unsupported'}
			<p class="text-base text-ink-3">Ce navigateur ne sait pas afficher de notifications.</p>
		{:else if desktopAlerts.permission === 'denied'}
			<p class="text-base text-ink-3">
				Le navigateur bloque les notifications de Crystal. Autorise-les dans les réglages du site
				(le cadenas à gauche de l’adresse), puis recharge la page.
			</p>
		{:else}
			<Segmented
				label="Notifications"
				value={desktopAlerts.effective}
				onchange={chooseAlerts}
				options={[
					{ value: 'off', label: 'Aucune', icon: BellOff },
					{ value: 'mine', label: 'Ce qui me concerne', icon: Bell },
					{ value: 'all', label: 'Tout le projet', icon: Users }
				]}
			/>
			<p class="mt-3 text-sm text-ink-3">
				{ALERT_HINTS[desktopAlerts.effective]}
			</p>
		{/if}
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
