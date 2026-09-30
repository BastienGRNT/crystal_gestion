<script lang="ts">
	import { MOSCOW_LABELS, type Moscow } from '$lib/modules/features/domain/feature';

	let { priority }: { priority: Moscow } = $props();
	const tones: Record<Moscow, string> = {
		must: 'bg-must',
		should: 'bg-should',
		could: 'bg-could',
		wont: 'bg-wont'
	};
</script>

<span
	class="inline-block size-2 shrink-0 rounded-full {tones[priority]}"
	title={MOSCOW_LABELS[priority]}
	aria-label={MOSCOW_LABELS[priority]}
></span>
