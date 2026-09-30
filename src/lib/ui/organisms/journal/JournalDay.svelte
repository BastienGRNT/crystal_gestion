<script lang="ts">
	import type { Snippet } from 'svelte';

	let { title, caption, children }: { title: string; caption: string; children: Snippet } =
		$props();
</script>

<section class="grid gap-x-8 gap-y-3 md:grid-cols-[8.5rem_1fr]">
	<header
		class="flex items-baseline gap-2.5 md:sticky md:top-6 md:flex-col md:items-end md:gap-0.5 md:self-start md:pt-3 md:text-right"
	>
		<h2 class="font-display text-[26px] leading-none italic">{title}</h2>
		<p class="font-mono text-[10.5px] tracking-[0.14em] text-ink-3 uppercase">{caption}</p>
	</header>
	<ol class="flex flex-col gap-3 border-l border-line pb-8 pl-5 sm:pl-8">{@render children()}</ol>
</section>
