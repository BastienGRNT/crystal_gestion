<script lang="ts">
	import { CalendarDays, Flag, Layers, UserRound } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import type { CreateKind } from '$lib/client/create-kinds';
	import { relativeDueDate } from '$lib/client/format';
	import { featureColors } from '$lib/client/views/feature-colors';
	import {
		dueOptions,
		featureOptions,
		peopleOptions,
		priorityOptions,
		statusOptions
	} from '$lib/client/views/task-menus';
	import { MOSCOW_LABELS } from '$lib/modules/features/domain/feature';
	import { STATUS_LABELS } from '$lib/modules/tasks/domain/task';
	import Dot from '$lib/ui/atoms/Dot.svelte';
	import FeatureMark from '$lib/ui/atoms/FeatureMark.svelte';
	import StatusIcon from '$lib/ui/atoms/StatusIcon.svelte';
	import AvatarStack from '$lib/ui/molecules/AvatarStack.svelte';
	import PropButton from '$lib/ui/molecules/PropButton.svelte';
	import { PRIORITY_COLORS } from '$lib/ui/tones';
	import type { CreateDraft } from './create-draft';

	interface Props {
		kind: CreateKind;
		draft: CreateDraft;
		/** The values the typed line resolves to (they win over the buttons). */
		shown: { featureId: string | null; assigneeIds: string[]; dueDate: string | null };
	}

	let { kind, draft = $bindable(), shown }: Props = $props();
	const { store, me } = useProject();
	const colorOf = $derived(featureColors(store.features.items));
	const feature = $derived(store.features.get(shown.featureId ?? ''));
	const people = $derived(store.members.items.filter((m) => shown.assigneeIds.includes(m.id)));
	const owner = $derived(store.members.get(draft.ownerId));
	const toggle = (ids: string[], id: string) =>
		ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
	const isTask = $derived(kind === 'task' || kind === 'bug');
</script>

<div class="flex flex-wrap gap-2 px-5 pb-4">
	{#if kind === 'feature'}
		<PropButton
			label="Priorité"
			icon={Flag}
			options={priorityOptions(draft.priority)}
			onpick={(priority) => (draft.priority = priority)}
		>
			{#snippet value()}<Dot color={PRIORITY_COLORS[draft.priority]} size={8} />{MOSCOW_LABELS[
					draft.priority
				]}{/snippet}
		</PropButton>
		<PropButton
			label="Responsable"
			icon={UserRound}
			options={peopleOptions(store.members.items, me.id, [draft.ownerId])}
			onpick={(id) => (draft.ownerId = id)}
		>
			{#snippet value()}{#if owner}<AvatarStack
						people={[owner]}
						size={18}
					/>{owner.name}{/if}{/snippet}
		</PropButton>
	{:else}
		<PropButton
			label="Feature"
			icon={Layers}
			options={featureOptions(store.features.items, shown.featureId)}
			onpick={(id) => (draft.featureId = id)}
			value={feature ? featureValue : undefined}
		/>
	{/if}
	{#if isTask}
		<PropButton
			label="Pour qui"
			icon={UserRound}
			multiple
			options={peopleOptions(store.members.items, me.id, shown.assigneeIds)}
			onpick={(id) => (draft.assigneeIds = toggle(draft.assigneeIds, id))}
			value={people.length ? peopleValue : undefined}
		/>
		<PropButton
			label="Échéance"
			icon={CalendarDays}
			options={dueOptions(shown.dueDate)}
			onpick={(date) => (draft.dueDate = date)}
			value={shown.dueDate ? dueValue : undefined}
		/>
		<PropButton
			label="Statut"
			icon={Flag}
			options={statusOptions(draft.status)}
			onpick={(status) => (draft.status = status)}
		>
			{#snippet value()}<StatusIcon status={draft.status} size={14} />{STATUS_LABELS[
					draft.status
				]}{/snippet}
		</PropButton>
	{/if}
</div>

{#snippet featureValue()}<FeatureMark
		title={feature!.title}
		color={colorOf(feature!.id)}
	/>{/snippet}
{#snippet peopleValue()}<AvatarStack {people} size={18} /><span class="truncate"
		>{people.map((p) => (p.id === me.id ? 'Moi' : p.name)).join(', ')}</span
	>{/snippet}
{#snippet dueValue()}<CalendarDays size={14} class="text-ink-3" />{relativeDueDate(
		shown.dueDate!
	)}{/snippet}
