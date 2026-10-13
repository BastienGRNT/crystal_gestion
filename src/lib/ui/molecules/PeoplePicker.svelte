<script lang="ts">
	import { UserRound } from '@lucide/svelte';
	import { firstName } from '$lib/client/format';
	import Avatar from '../atoms/Avatar.svelte';
	import type { Person } from '../types';

	interface Props {
		people: Person[];
		value: string | null;
		meId: string;
		onchange: (value: string | null) => void;
		/** Label of the "nobody" choice. */
		none?: string;
		label?: string;
	}

	let {
		people,
		value,
		meId,
		onchange,
		none = 'Personne',
		label = 'Qui s’en occupe'
	}: Props = $props();

	const chip = (selected: boolean) => [
		'inline-flex h-10 items-center gap-2 rounded-full border pr-3.5 pl-1.5 text-base font-medium transition-colors',
		selected
			? 'border-accent bg-accent-soft text-accent-text'
			: 'border-line text-ink-2 hover:border-line-strong hover:bg-surface-2'
	];
</script>

<div class="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
	<button
		type="button"
		role="radio"
		aria-checked={value === null}
		class={chip(value === null)}
		onclick={() => onchange(null)}
	>
		<span class="flex size-7 items-center justify-center rounded-full bg-sunken text-ink-3"
			><UserRound size={14} /></span
		>
		{none}
	</button>
	{#each people as person (person.id)}
		<button
			type="button"
			role="radio"
			aria-checked={value === person.id}
			class={chip(value === person.id)}
			onclick={() => onchange(person.id)}
		>
			<Avatar name={person.name} color={person.color} size="md" />
			{person.id === meId ? 'Moi' : firstName(person.name)}
		</button>
	{/each}
</div>
