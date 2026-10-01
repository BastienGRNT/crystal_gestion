<script lang="ts" generics="V extends string | null">
	import Dot from '../atoms/Dot.svelte';
	import Pill from '../atoms/Pill.svelte';

	interface Props {
		options: { value: V; label: string; dot?: string }[];
		value: V;
		onchange: (value: V) => void;
	}

	let { options, value, onchange }: Props = $props();
</script>

<div class="flex flex-wrap gap-1">
	{#each options as option (option.value ?? '')}
		<Pill selected={option.value === value} onclick={() => onchange(option.value)}>
			{#if option.dot}<Dot color={option.dot} />{/if}{option.label}
		</Pill>
	{/each}
</div>
