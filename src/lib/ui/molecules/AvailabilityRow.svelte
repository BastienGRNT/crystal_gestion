<script lang="ts">
	import Avatar from '../atoms/Avatar.svelte';

	interface Props {
		name: string;
		color: string;
		online: boolean;
		ranges: { key: string; label: string; maybe: boolean }[];
	}

	let { name, color, online, ranges }: Props = $props();
</script>

<li class="flex items-center gap-3 py-2">
	<Avatar {name} {color} size={28} {online} />
	<div class="min-w-0 flex-1">
		<p class="flex items-baseline gap-2 text-[13.5px]">
			<span class="truncate font-medium">{name}</span>
			{#if online}<span class="text-[11.5px] text-success">en ligne maintenant</span>{/if}
		</p>
		<div class="mt-0.5 flex flex-wrap gap-1.5">
			{#each ranges as range (range.key)}
				<span
					class="rounded-[5px] px-1.5 font-mono text-[11px] {range.maybe
						? 'border border-dashed border-line-strong text-ink-3'
						: 'bg-accent-soft text-accent'}">{range.label}{range.maybe ? ' · peut-être' : ''}</span
				>
			{:else}
				<span class="text-[12px] text-ink-3">Pas de créneau indiqué</span>
			{/each}
		</div>
	</div>
</li>
