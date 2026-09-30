<script lang="ts">
	import type { Snippet } from 'svelte';

	type Tone =
		'neutral' | 'accent' | 'must' | 'should' | 'could' | 'wont' | 'danger' | 'success' | 'warning';
	let {
		tone = 'neutral',
		title,
		children
	}: { tone?: Tone; title?: string; children: Snippet } = $props();

	const tones: Record<Tone, string> = {
		neutral: 'bg-sunken text-ink-2',
		accent: 'bg-accent-soft text-accent-text',
		must: 'bg-must/12 text-must',
		should: 'bg-should/14 text-should',
		could: 'bg-could/12 text-could',
		wont: 'bg-wont/14 text-wont',
		danger: 'bg-danger/12 text-danger',
		success: 'bg-success/12 text-success',
		warning: 'bg-warning/14 text-warning'
	};
</script>

<span
	{title}
	class="inline-flex h-[22px] items-center gap-1 rounded-md px-2 text-xs font-medium whitespace-nowrap {tones[
		tone
	]}"
>
	{@render children()}
</span>
