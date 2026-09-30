<script lang="ts">
	import { page } from '$app/state';
	import Logo from '$lib/ui/atoms/Logo.svelte';

	const message = $derived(
		page.status === 404
			? 'Cette page n’existe pas (ou plus).'
			: (page.error?.message ?? 'Erreur inattendue')
	);
</script>

<svelte:head><title>{page.status} · Crystal</title></svelte:head>

<main class="flex min-h-dvh flex-col items-center justify-center gap-4 bg-bg p-6 text-center">
	<Logo size={32} />
	<p class="font-mono text-[13px] text-ink-3">Erreur {page.status}</p>
	<h1 class="font-display text-[44px] leading-none">{message}</h1>
	<a href="/" class="mt-2 text-[14px] font-medium text-accent hover:underline"
		>Revenir à mes projets</a
	>
</main>
