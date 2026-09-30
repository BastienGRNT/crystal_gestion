<script lang="ts">
	import { ExternalLink, Send } from '@lucide/svelte';
	import { safeUrl } from '$lib/modules/resources/domain/link';
	import type { Account, Contact, Link } from '$lib/modules/resources/domain/resources';

	let { item }: { item: Account | Link | Contact } = $props();
	const target = $derived.by(() => {
		if (item.kind === 'contact')
			return item.email ? { href: `mailto:${item.email}`, label: 'Écrire', icon: Send } : null;
		return item.url ? { href: safeUrl(item.url), label: 'Ouvrir', icon: ExternalLink } : null;
	});
</script>

{#if target}
	<a
		href={target.href}
		target={item.kind === 'contact' ? undefined : '_blank'}
		rel="noopener noreferrer"
		class="mt-3 inline-flex h-7 items-center gap-1.5 rounded-md bg-accent px-2.5 text-sm font-medium text-accent-ink shadow-sm transition hover:brightness-110"
		><target.icon size={13} />{target.label}</a
	>
{/if}
