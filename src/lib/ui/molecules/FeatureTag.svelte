<script lang="ts">
	import type { FeatureTagView } from '$lib/client/views/element-view';
	import PriorityDot from '../atoms/PriorityDot.svelte';

	let { feature }: { feature: FeatureTagView } = $props();
</script>

<a
	href={feature.href}
	title="{feature.ref} · {feature.title}"
	class="inline-flex h-6 max-w-52 min-w-0 items-center gap-1.5 rounded-full border border-line bg-surface-2 px-2 text-[12px] text-ink-2 transition hover:border-line-strong hover:text-ink"
>
	<PriorityDot priority={feature.priority} />
	<span class="truncate">{feature.title}</span>
</a>
