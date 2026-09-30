<script lang="ts">
	interface Props {
		value: string;
		label: string;
		href: string;
		/** Draws the eye when there is something to act on. */
		emphasis?: boolean;
	}

	let { value, label, href, emphasis = false }: Props = $props();
</script>

<a
	{href}
	class="group flex min-w-0 flex-col rounded-xl border bg-surface px-4 py-3 shadow-card transition hover:-translate-y-px hover:border-line-strong {emphasis
		? 'border-accent/40'
		: 'border-line'}"
>
	<span class="font-display text-4xl {emphasis ? 'text-accent-text' : ''}">{value}</span>
	<span class="mt-0.5 text-sm text-ink-2 group-hover:text-ink">{label} →</span>
</a>
