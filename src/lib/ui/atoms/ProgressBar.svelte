<script lang="ts">
	let { ratio, label }: { ratio: number; label?: string } = $props();
	const complete = $derived(ratio >= 1);
</script>

<div
	class="h-1.5 w-full overflow-hidden rounded-full bg-sunken"
	role="progressbar"
	aria-label={label}
	aria-valuenow={Math.round(ratio * 100)}
	aria-valuemin={0}
	aria-valuemax={100}
>
	<div
		class="h-full rounded-full transition-[width] duration-500 {complete ? 'prism' : 'bg-accent'}"
		style="width:{Math.round(ratio * 100)}%"
	></div>
</div>
