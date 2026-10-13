<script lang="ts">
	import { Check, Copy, Link } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import Button from '$lib/ui/atoms/Button.svelte';
	import Dialog from '$lib/ui/molecules/Dialog.svelte';

	let { open = $bindable(), projectId }: { open: boolean; projectId: string } = $props();
	const { app, actions } = useApp();
	const project = $derived(app.projects.get(projectId));
	let link = $state<string | null>(null);
	let busy = $state(false);
	let copied = $state(false);

	$effect(() => {
		if (!open) return;
		link = null;
		copied = false;
	});

	async function create() {
		busy = true;
		link = (await actions.projects.invite(projectId))?.link ?? null;
		busy = false;
	}

	async function copy() {
		if (!link) return;
		await navigator.clipboard.writeText(link).catch(() => {});
		copied = true;
	}
</script>

<Dialog
	bind:open
	size="sm"
	title="Inviter dans « {project?.name ?? ''} »"
	description="Un lien à envoyer (SMS, mail…). Il sert une seule fois et marche 7 jours. La personne crée son compte ou se connecte, et arrive dans le projet."
>
	{#if link}
		<div class="flex flex-col gap-3">
			<input
				readonly
				value={link}
				aria-label="Lien d’invitation"
				onfocus={(e) => e.currentTarget.select()}
				class="h-11 w-full rounded-xl border border-line-strong/70 bg-surface-2 px-3.5 font-mono text-sm"
			/>
			<Button variant="primary" size="lg" icon={copied ? Check : Copy} onclick={copy}>
				{copied ? 'Copié, envoie-le' : 'Copier le lien'}
			</Button>
		</div>
	{:else}
		<Button variant="primary" size="lg" class="w-full" icon={Link} loading={busy} onclick={create}
			>Créer le lien d’invitation</Button
		>
	{/if}
</Dialog>
