<script lang="ts">
	import { Flag, UserRound } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import { featureColors } from '$lib/client/views/feature-colors';
	import { peopleOptions, priorityOptions } from '$lib/client/views/task-menus';
	import { MOSCOW_LABELS, type Feature } from '$lib/modules/features/domain/feature';
	import { progressOf } from '$lib/modules/tasks/domain/progress';
	import Dot from '$lib/ui/atoms/Dot.svelte';
	import ProgressRing from '$lib/ui/atoms/ProgressRing.svelte';
	import AvatarStack from '$lib/ui/molecules/AvatarStack.svelte';
	import InlineRichText from '$lib/ui/molecules/InlineRichText.svelte';
	import InlineText from '$lib/ui/molecules/InlineText.svelte';
	import PropButton from '$lib/ui/molecules/PropButton.svelte';
	import { PRIORITY_COLORS } from '$lib/ui/tones';

	let { feature }: { feature: Feature } = $props();
	const { store, actions, refs, me } = useProject();
	const color = $derived(featureColors(store.features.items)(feature.id));
	const progress = $derived(
		progressOf(store.tasks.items.filter((task) => task.featureId === feature.id))
	);
	const owner = $derived(store.members.get(feature.ownerId ?? ''));
	const update = (changes: Partial<Feature>) => actions.features.update(feature.id, changes);
</script>

<header class="mb-8">
	<div class="flex items-center gap-3">
		<span class="size-4 shrink-0 rounded-[5px]" style="background:{color}"></span>
		<InlineText
			value={feature.title}
			onsave={(title) => update({ title })}
			class="text-2xl font-semibold tracking-[-0.02em]"
		/>
	</div>
	<div class="mt-2 max-w-[72ch] text-base text-ink-2">
		<InlineRichText
			value={feature.description}
			resolve={refs.resolve}
			suggest={refs.suggest}
			placeholder="À quoi sert cette feature ? (une phrase)"
			onsave={(description) => update({ description })}
		/>
	</div>
	<div class="mt-4 flex flex-wrap items-center gap-2">
		<PropButton
			label="Priorité"
			icon={Flag}
			options={priorityOptions(feature.priority)}
			onpick={(priority) => update({ priority })}
		>
			{#snippet value()}<Dot color={PRIORITY_COLORS[feature.priority]} size={8} />{MOSCOW_LABELS[
					feature.priority
				]}{/snippet}
		</PropButton>
		<PropButton
			label="Responsable"
			icon={UserRound}
			options={peopleOptions(store.members.items, me.id, feature.ownerId ? [feature.ownerId] : [])}
			onpick={(id) => update({ ownerId: id === feature.ownerId ? null : id })}
			value={owner ? ownerValue : undefined}
		/>
		<span class="inline-flex h-8 items-center gap-2 px-2.5 text-ui text-ink-2">
			<ProgressRing ratio={progress.ratio} {color} size={16} />
			{progress.done} sur {progress.total} faite{progress.done > 1 ? 's' : ''}
		</span>
	</div>
</header>

{#snippet ownerValue()}<AvatarStack people={[owner!]} size={18} />{owner!.name}{/snippet}
