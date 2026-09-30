<script lang="ts">
	import Select from '../../atoms/Select.svelte';

	type Option = { value: string; label: string };
	interface Props {
		person: string;
		feature: string;
		people: Option[];
		features: Option[];
		onchange: (filters: { person: string; feature: string }) => void;
	}

	let { person, feature, people, features, onchange }: Props = $props();
</script>

<div
	class="flex max-w-full items-center gap-1 overflow-x-auto rounded-lg border border-line bg-surface px-1"
>
	<Select
		label="Filtrer par personne"
		value={person}
		options={[{ value: '', label: 'Toute l’équipe' }, ...people]}
		onchange={(value) => onchange({ person: value, feature })}
	/>
	<span class="h-4 w-px bg-line"></span>
	<Select
		label="Filtrer par feature"
		value={feature}
		options={[
			{ value: '', label: 'Toutes les features' },
			{ value: 'none', label: 'Sans feature' },
			...features
		]}
		onchange={(value) => onchange({ person, feature: value })}
	/>
</div>
