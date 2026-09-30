<script lang="ts">
	import Avatar from '../atoms/Avatar.svelte';

	type Person = { id: string; name: string; color: string };
	let { people, size = 20 }: { people: Person[]; size?: number } = $props();
</script>

<span class="flex -space-x-1.5">
	{#each people as person (person.id)}<Avatar name={person.name} color={person.color} {size} />{/each}
</span>
