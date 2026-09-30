<script lang="ts">
	import { domainOf, safeUrl } from '$lib/modules/resources/domain/link';
	import type { Link } from '$lib/modules/resources/domain/resources';

	let { link }: { link: Link } = $props();
</script>

<div class="min-w-0 flex-1 basis-48">
	{#if link.url}
		<a
			href={safeUrl(link.url)}
			target="_blank"
			rel="noopener noreferrer"
			class="block truncate text-base font-medium transition hover:text-accent">{link.title}</a
		>
		<p class="truncate font-mono text-xs text-ink-3">{domainOf(link.url)}</p>
	{:else}
		<p class="truncate text-base font-medium">{link.title}</p>
		<p class="text-xs text-ink-3">Pas d’URL</p>
	{/if}
</div>
