<script lang="ts">
	/** A small colored status / priority / feature marker. `color` is a CSS color or var(). */
	let { color, size = 7 }: { color: string; size?: number } = $props();
</script>

<span
	class="inline-block shrink-0 rounded-full"
	style="width:{size}px;height:{size}px;background:{color}"
></span>
