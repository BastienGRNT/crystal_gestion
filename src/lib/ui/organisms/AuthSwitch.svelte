<script lang="ts">
	/** The way to the other auth page, under the card: always visible, never a dead end. */
	let { question, label, href }: { question: string; label: string; href: string } = $props();
</script>

<p
	class="mt-5 flex items-center justify-center gap-2 border-t border-line pt-5 text-base text-ink-3"
>
	{question}
	<a class="font-semibold text-accent-text hover:underline" {href}>{label}</a>
</p>
