<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		href: string;
		label: string;
		external?: boolean;
		download?: boolean;
		children: Snippet;
	}

	let { href, label, external = false, download = false, children }: Props = $props();
</script>

<a
	{href}
	aria-label={label}
	title={label}
	target={external ? '_blank' : undefined}
	rel={external ? 'noopener noreferrer' : undefined}
	download={download || undefined}
	class="inline-flex size-6 shrink-0 items-center justify-center rounded-md text-ink-3 transition hover:bg-sunken hover:text-ink"
>
	{@render children()}
</a>
