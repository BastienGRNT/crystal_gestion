<script lang="ts">
	import { Plus } from '@lucide/svelte';
	import Avatar from '../atoms/Avatar.svelte';
	import Popover from './Popover.svelte';
	import MenuItem from './MenuItem.svelte';

	type Person = { id: string; name: string; color: string };
	interface Props {
		people: Person[];
		selected: string[];
		onchange: (ids: string[]) => void;
	}

	let { people, selected, onchange }: Props = $props();
	let open = $state(false);
	const chosen = $derived(people.filter((person) => selected.includes(person.id)));
	const toggle = (id: string) =>
		onchange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
</script>

<Popover {open} onclose={() => (open = false)} width="w-52">
	{#snippet trigger()}
		<button
			type="button"
			onclick={() => (open = !open)}
			class="flex h-8 items-center gap-1.5 rounded-md px-2 transition hover:bg-surface"
		>
			{#each chosen as person (person.id)}
				<span class="flex items-center gap-1.5 text-[13px]"
					><Avatar name={person.name} color={person.color} size={20} />{chosen.length === 1
						? person.name
						: ''}</span
				>
			{:else}
				<span class="flex items-center gap-1 text-[13px] text-ink-3"
					><Plus size={13} /> Assigner</span
				>
			{/each}
		</button>
	{/snippet}
	{#each people as person (person.id)}
		<MenuItem onclick={() => toggle(person.id)} active={selected.includes(person.id)}>
			<Avatar name={person.name} color={person.color} size={18} />
			<span class="flex-1">{person.name}</span>
			{#if selected.includes(person.id)}<span class="text-accent">✓</span>{/if}
		</MenuItem>
	{/each}
</Popover>
