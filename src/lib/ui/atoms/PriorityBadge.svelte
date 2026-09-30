<script lang="ts">
	import { MOSCOW_HINTS, MOSCOW_LABELS, type Moscow } from '$lib/modules/features/domain/feature';
	import Badge from './Badge.svelte';

	let { priority }: { priority: Moscow } = $props();
</script>

<Badge tone={priority} title="Priorité : {MOSCOW_HINTS[priority]}">{MOSCOW_LABELS[priority]}</Badge>
