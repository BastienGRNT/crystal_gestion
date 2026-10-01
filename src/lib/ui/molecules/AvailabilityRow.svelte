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
	<Avatar {name} {color} size={24} {online} />
	<div class="min-w-0 flex-1">
		<p class="flex items-baseline gap-2 text-ui">
			<span class="truncate font-medium">{name}</span>
			{#if online}<span class="text-xs text-success">en ligne maintenant</span>{/if}
		</p>
		<div class="mt-0.5 flex flex-wrap gap-1.5">
			{#each ranges as range (range.key)}
				<span
					class="rounded-[5px] px-1.5 font-mono text-2xs {range.maybe
						? 'border border-dashed border-line-strong text-ink-3'
						: 'bg-accent-soft text-accent'}">{range.label}{range.maybe ? ' · peut-être' : ''}</span
				>
			{:else}
				<span class="text-xs text-ink-3">Pas de créneau indiqué</span>
			{/each}
		</div>
	</div>
</li>
