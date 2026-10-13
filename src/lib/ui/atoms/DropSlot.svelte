<script lang="ts">
	/** Where the dragged card will land: exactly its size, so nothing around it jumps. */
	let { height }: { height: number } = $props();
</script>

<div
	data-drop-slot
	style:height="{height}px"
	class="rounded-xl border-2 border-dashed border-accent/50 bg-accent-soft/60"
	aria-hidden="true"
></div>
