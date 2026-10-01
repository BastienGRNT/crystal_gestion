<script lang="ts">
	interface Props {
		name: string;
		color: string;
		size?: number;
		online?: boolean;
	}

	let { name, color, size = 24, online = false }: Props = $props();
	const initials = $derived(
		name
			.split(/\s+/)
			.map((part) => part[0])
			.join('')
			.slice(0, 2)
			.toUpperCase()
	);
</script>

<span class="relative inline-flex shrink-0" title={name}>
	<span
		class="inline-flex items-center justify-center rounded-full font-semibold text-white ring-2 ring-panel"
		style="width:{size}px;height:{size}px;background:{color};font-size:{Math.round(size * 0.4)}px"
	>
		{initials}
	</span>
	{#if online}
		<span class="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full bg-success ring-2 ring-panel"
		></span>
	{/if}
</span>
