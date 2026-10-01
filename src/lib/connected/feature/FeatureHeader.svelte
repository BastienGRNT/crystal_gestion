<script lang="ts">
	import { useProject } from '$lib/client/context';
	import { featureColors } from '$lib/client/views/feature-colors';
	import { peopleOptions, priorityOptions } from '$lib/client/views/task-menus';
	import { MOSCOW_LABELS, type Feature } from '$lib/modules/features/domain/feature';
	import { progressOf } from '$lib/modules/tasks/domain/progress';
	import Avatar from '$lib/ui/atoms/Avatar.svelte';
	import Dot from '$lib/ui/atoms/Dot.svelte';
	import FormField from '$lib/ui/molecules/form/FormField.svelte';
	import SelectField from '$lib/ui/molecules/form/SelectField.svelte';
	import InlineRichText from '$lib/ui/molecules/InlineRichText.svelte';
	import { PRIORITY_COLORS } from '$lib/ui/tones';

	/** What the feat is for, its priority, who owns it and how far it is. */
	let { feature }: { feature: Feature } = $props();
	const { store, actions, refs, me } = useProject();
	const color = $derived(featureColors(store.features.items)(feature.id));
	const progress = $derived(
		progressOf(store.tasks.items.filter((task) => task.featureId === feature.id))
	);
	const owner = $derived(store.members.get(feature.ownerId ?? ''));
	const update = (changes: Partial<Feature>) => actions.features.update(feature.id, changes);
</script>

<div class="mb-8 max-w-[75ch] text-lg text-ink-2">
	<InlineRichText
		value={feature.description}
		resolve={refs.resolve}
		suggest={refs.suggest}
		placeholder="À quoi sert cette Feat ? (une phrase pour toute l’équipe)"
		onsave={(description) => update({ description })}
	/>
</div>
<div class="mb-9 grid gap-4 sm:grid-cols-3">
	<FormField label="Priorité">
		<SelectField
			label="Priorité"
			options={priorityOptions(feature.priority)}
			onpick={(priority) => update({ priority })}
		>
			{#snippet value()}<Dot color={PRIORITY_COLORS[feature.priority]} size={9} />{MOSCOW_LABELS[
					feature.priority
				]}{/snippet}
		</SelectField>
	</FormField>
	<FormField label="Responsable">
		<SelectField
			label="Responsable"
			options={peopleOptions(store.members.items, me.id, feature.ownerId ? [feature.ownerId] : [])}
			onpick={(id) => update({ ownerId: id === feature.ownerId ? null : id })}
		>
			{#snippet value()}
				{#if owner}<Avatar name={owner.name} color={owner.color} size={24} />{owner.id === me.id
						? 'Moi'
						: owner.name}
				{:else}<span class="text-ink-3">Personne</span>{/if}
			{/snippet}
		</SelectField>
	</FormField>
	<FormField label="Avancement">
		<div class="flex h-11 items-center gap-3">
			<span class="text-lg font-extrabold tabular-nums">{progress.done} / {progress.total}</span>
			<span class="h-2 flex-1 overflow-hidden rounded-full bg-sunken">
				<span
					class="block h-full rounded-full {progress.ratio >= 1 ? 'prism' : ''}"
					style="width:{Math.round(progress.ratio * 100)}%;{progress.ratio >= 1
						? ''
						: `background:${color}`}"
				></span>
			</span>
		</div>
	</FormField>
</div>
