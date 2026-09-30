<script lang="ts">
	import { MOSCOW_LABELS, type Moscow } from '$lib/modules/features/domain/feature';
	import Badge from './Badge.svelte';

	let { priority }: { priority: Moscow } = $props();
</script>

<Badge tone={priority}>{MOSCOW_LABELS[priority]}</Badge>
