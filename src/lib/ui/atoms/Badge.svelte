<script lang="ts">
	import type { Snippet } from 'svelte';

	type Tone =
		'neutral' | 'accent' | 'must' | 'should' | 'could' | 'wont' | 'danger' | 'success' | 'warning';
	let { tone = 'neutral', children }: { tone?: Tone; children: Snippet } = $props();

	const tones: Record<Tone, string> = {
		neutral: 'bg-sunken text-ink-2',
		accent: 'bg-accent-soft text-accent',
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
	class="inline-flex h-5 items-center gap-1 rounded-sm px-1.5 text-[11.5px] font-medium whitespace-nowrap {tones[
		tone
	]}"
>
	{@render children()}
</span>
