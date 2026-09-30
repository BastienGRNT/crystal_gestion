<script lang="ts">
	import { browser } from '$app/environment';
	import Spinner from '$lib/ui/atoms/Spinner.svelte';

	let { src }: { src: string } = $props();
	// Large logs would freeze the drawer: the preview is only a glimpse, the download has the rest.
	const LIMIT = 20_000;
	async function load(url: string) {
		const response = await fetch(url);
		if (!response.ok) throw new Error('Aperçu indisponible');
		return (await response.text()).slice(0, LIMIT);
	}
	const text = $derived(browser ? load(src) : new Promise<string>(() => {}));
</script>

{#await text}
	<div class="flex h-32 items-center justify-center text-ink-3"><Spinner /></div>
{:then content}
	<pre
		class="max-h-96 overflow-auto p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap text-ink-2">{content ||
			'Fichier vide'}</pre>
{:catch}
	<p class="p-4 text-sm text-ink-3">Aperçu indisponible.</p>
{/await}
