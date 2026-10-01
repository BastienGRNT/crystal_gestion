<script lang="ts">
	import Avatar from '../atoms/Avatar.svelte';
	import Pill from '../atoms/Pill.svelte';
	import type { Person } from '../types';

	interface Props {
		people: Person[];
		selected: string[];
		meId: string;
		ontoggle: (id: string) => void;
	}

	let { people, selected, meId, ontoggle }: Props = $props();
</script>

<div class="flex flex-wrap gap-1">
	{#each people as person (person.id)}
		<Pill avatar selected={selected.includes(person.id)} onclick={() => ontoggle(person.id)}>
			<Avatar name={person.name} color={person.color} size={20} />
			{person.id === meId ? `${person.name} (moi)` : person.name}
		</Pill>
	{/each}
</div>
