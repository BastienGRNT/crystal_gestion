<script lang="ts">
	import Avatar from '../../atoms/Avatar.svelte';
	import type { Person } from '../../types';

	interface Props {
		label: string;
		people: Person[];
		selected: string[];
		meId: string;
		ontoggle: (id: string) => void;
		/** Extra first choice for « nobody » (single choice). */
		none?: { label: string; active: boolean; onpick: () => void };
	}

	let { label, people, selected, meId, ontoggle, none }: Props = $props();
	const chip =
		'inline-flex h-11 items-center gap-2.5 rounded-full border-[1.5px] text-sm font-semibold transition';
</script>

<div role="group" aria-label={label} class="flex flex-wrap gap-2">
	{#if none}
		<button
			type="button"
			aria-pressed={none.active}
			onclick={none.onpick}
			class="{chip} px-4 {none.active
				? 'border-ink bg-surface-2'
				: 'border-line-strong text-ink-2 hover:border-ink-3'}">{none.label}</button
		>
	{/if}
	{#each people as person (person.id)}
		{@const on = selected.includes(person.id)}
		<button
			type="button"
			aria-pressed={on}
			onclick={() => ontoggle(person.id)}
			class="{chip} pr-4 pl-1.5 {on
				? 'border-ink bg-surface-2'
				: 'border-line-strong hover:border-ink-3'}"
		>
			<Avatar name={person.name} color={person.color} size={30} />
			{person.id === meId ? 'Moi' : person.name}
		</button>
	{/each}
</div>
