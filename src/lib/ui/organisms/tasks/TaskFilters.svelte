<script lang="ts">
	import { ChevronDown, Layers, Users, Wrench } from '@lucide/svelte';
	import PickMenu from '../../molecules/PickMenu.svelte';
	import type { PickOption } from '../../types';

	interface Props {
		person: PickOption<string>[];
		personLabel: string;
		features: PickOption<string>[];
		featureLabel: string;
		fixOnly: boolean;
		onperson: (id: string) => void;
		onfeature: (id: string) => void;
		onfix: () => void;
	}

	let { person, personLabel, features, featureLabel, fixOnly, onperson, onfeature, onfix }: Props =
		$props();
	const filter =
		'inline-flex h-9 items-center gap-2 rounded-[10px] border-[1.5px] px-3 text-ui font-semibold whitespace-nowrap transition';
	const tone = (on: boolean) =>
		on
			? 'border-ink bg-surface text-ink'
			: 'border-line-strong bg-surface text-ink-2 hover:border-ink-3';
</script>

<PickMenu title="Les Tasks de" options={person} onpick={onperson} align="end">
	{#snippet trigger(toggle)}
		<button type="button" onclick={toggle} class="{filter} {tone(personLabel !== 'Tout le monde')}"
			><Users size={15} />{personLabel}<ChevronDown size={14} /></button
		>
	{/snippet}
</PickMenu>
<PickMenu title="Feat" options={features} onpick={onfeature} align="end">
	{#snippet trigger(toggle)}
		<button
			type="button"
			onclick={toggle}
			class="{filter} {tone(featureLabel !== 'Toutes les Feats')}"
			><Layers size={15} />{featureLabel}<ChevronDown size={14} /></button
		>
	{/snippet}
</PickMenu>
<button type="button" aria-pressed={fixOnly} onclick={onfix} class="{filter} {tone(fixOnly)}">
	<Wrench size={15} class={fixOnly ? 'text-must' : ''} />Fix seulement
</button>
