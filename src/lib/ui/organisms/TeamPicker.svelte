<script lang="ts">
	import Avatar from '../atoms/Avatar.svelte';
	import ToggleChip from '../molecules/ToggleChip.svelte';
	import type { Person } from '../types';

	/** Form field: selected people are submitted as repeated `members` values. */
	let { people }: { people: Person[] } = $props();
	let selected = $state<string[]>([]);
	const toggle = (id: string) => (selected = selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
</script>

{#each selected as id (id)}<input type="hidden" name="members" value={id} />{/each}
<div class="flex flex-wrap gap-2">
	{#each people as person (person.id)}
		<ToggleChip pressed={selected.includes(person.id)} onclick={() => toggle(person.id)}>
			<Avatar name={person.name} color={person.color} size={20} />{person.name}
		</ToggleChip>
	{:else}
		<p class="pt-1.5 text-[13px] text-ink-3">Personne d’autre pour l’instant.</p>
	{/each}
</div>
