<script lang="ts">
	import { Copy, Ellipsis, ExternalLink, Eye, EyeOff, Pencil, Trash2 } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import { tint } from '$lib/client/labels';
	import { hostOf, type VaultEntry } from '$lib/modules/vault/domain/entry';
	import IconButton from '$lib/ui/atoms/IconButton.svelte';
	import Menu from '$lib/ui/molecules/Menu.svelte';

	let { entry, onedit }: { entry: VaultEntry; onedit: () => void } = $props();
	const { actions } = useApp();
	const host = $derived(hostOf(entry.url));
	const color = $derived([...entry.name].reduce((sum, c) => sum + c.charCodeAt(0), 0) % 8);

	let secret = $state<string | null>(null);
	let timer: ReturnType<typeof setTimeout> | undefined;

	/** A revealed password hides itself again after 30 s. */
	async function toggle() {
		clearTimeout(timer);
		if (secret !== null) return void (secret = null);
		secret = await actions.vault.reveal(entry.id);
		timer = setTimeout(() => (secret = null), 30_000);
	}

	async function copySecret() {
		await actions.vault.copy(secret ?? (await actions.vault.reveal(entry.id)), 'Mot de passe');
	}
</script>

<article class="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4 shadow-card">
	<header class="flex items-start gap-3">
		<span
			class="flex size-10 shrink-0 items-center justify-center rounded-xl text-md font-bold text-white"
			style:background-color={tint(color)}
		>
			{entry.name.charAt(0).toUpperCase()}
		</span>
		<div class="min-w-0 flex-1">
			<h3 class="truncate text-md font-semibold">{entry.name}</h3>
			{#if entry.url}
				<a
					href={entry.url}
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex max-w-full items-center gap-1 text-sm text-accent-text hover:underline"
				>
					<span class="truncate">{host}</span><ExternalLink size={12} class="shrink-0" />
				</a>
			{/if}
		</div>
		<Menu
			label="Options de l’accès"
			items={[
				{ label: 'Modifier', icon: Pencil, run: onedit },
				{ label: 'Supprimer', icon: Trash2, danger: true, run: () => actions.vault.remove(entry) }
			]}
		>
			{#snippet trigger({ props })}<IconButton
					icon={Ellipsis}
					label="Options"
					size="sm"
					{...props}
				/>{/snippet}
		</Menu>
	</header>

	{#if entry.username || entry.hasSecret}
		<dl class="flex flex-col divide-y divide-line rounded-xl border border-line bg-surface-2">
			{#if entry.username}
				<div class="flex items-center gap-2 py-1 pr-1 pl-3">
					<dt class="w-24 shrink-0 text-sm text-ink-3">Identifiant</dt>
					<dd class="min-w-0 flex-1 truncate font-mono text-sm">{entry.username}</dd>
					<IconButton
						icon={Copy}
						label="Copier l’identifiant"
						size="sm"
						onclick={() => actions.vault.copy(entry.username, 'Identifiant')}
					/>
				</div>
			{/if}
			{#if entry.hasSecret}
				<div class="flex items-center gap-2 py-1 pr-1 pl-3">
					<dt class="w-24 shrink-0 text-sm text-ink-3">Mot de passe</dt>
					<dd class="min-w-0 flex-1 truncate font-mono text-sm">{secret ?? '••••••••••'}</dd>
					<IconButton
						icon={secret !== null ? EyeOff : Eye}
						label={secret !== null ? 'Masquer' : 'Afficher'}
						size="sm"
						onclick={toggle}
					/>
					<IconButton icon={Copy} label="Copier le mot de passe" size="sm" onclick={copySecret} />
				</div>
			{/if}
		</dl>
	{/if}

	{#if entry.notes}<p class="line-clamp-3 text-sm whitespace-pre-line text-ink-2">
			{entry.notes}
		</p>{/if}
</article>
