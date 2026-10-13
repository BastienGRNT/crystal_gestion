<script lang="ts">
	import { BOXES } from '$lib/client/labels';
	import type { Quadrant } from '$lib/modules/tasks/domain/task';

	let { quadrant }: { quadrant: Quadrant | null } = $props();
	const box = $derived(BOXES[quadrant ?? 'inbox']);
</script>

<span
	class={[
		'inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-xs font-medium',
		box.soft,
		box.text
	]}
>
	<span class={['size-1.5 rounded-full', box.dot]}></span>{box.label}
</span>
