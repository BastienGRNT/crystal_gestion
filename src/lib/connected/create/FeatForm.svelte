<script lang="ts">
	import { untrack } from 'svelte';
	import { useProject } from '$lib/client/context';
	import { overlays } from '$lib/client/overlays.svelte';
	import { MOSCOW, MOSCOW_LABELS, type Moscow } from '$lib/modules/features/domain/feature';
	import ChoiceCards from '$lib/ui/molecules/form/ChoiceCards.svelte';
	import FormField from '$lib/ui/molecules/form/FormField.svelte';
	import LineList from '$lib/ui/molecules/form/LineList.svelte';
	import PeopleChoice from '$lib/ui/molecules/form/PeopleChoice.svelte';
	import TextField from '$lib/ui/molecules/form/TextField.svelte';
	import FormDialog from '$lib/ui/organisms/FormDialog.svelte';
	import { emptyDraft, submitFeat } from './create-draft';
	import { created } from './created';

	const { store, actions, me } = useProject();
	const opened = untrack(() => overlays.create!);
	let draft = $state(emptyDraft(opened.seed, me.id));
	const close = () => (overlays.create = null);
	const HINTS: Record<Moscow, string> = {
		must: 'Pas de V1 sans elle',
		should: 'On la veut, sans bloquer',
		could: 'S’il reste du temps',
		wont: 'Une idée pour plus tard'
	};
	const count = $derived(draft.lines.length);
	const label = $derived(
		count ? `Créer la Feat et ses ${count} Task${count > 1 ? 's' : ''}` : 'Créer la Feat'
	);

	async function submit() {
		if (!draft.title.trim()) return;
		close();
		created(await submitFeat(draft, actions), 'Feat créée');
	}
</script>

<FormDialog
	title="Nouvelle Feat"
	submitLabel={label}
	disabled={!draft.title.trim()}
	note="Elle aura son fil de discussion et son dossier dans le Drive."
	width="max-w-[680px]"
	onsubmit={submit}
	onclose={close}
>
	{#snippet lead()}<span class="size-4 rounded-[5px] prism"></span>{/snippet}
	<FormField label="Nom de la Feat">
		<TextField main bind:value={draft.title} placeholder="Ex. Paiement Stripe" />
	</FormField>
	<FormField label="À quoi elle sert ?" optional>
		<TextField bind:value={draft.body} rows={2} placeholder="Une phrase pour toute l’équipe" />
	</FormField>
	<FormField label="Priorité">
		<ChoiceCards
			label="Priorité"
			value={draft.priority}
			onchange={(priority) => (draft.priority = priority)}
			choices={MOSCOW.map((p) => ({ value: p, label: MOSCOW_LABELS[p], hint: HINTS[p] }))}
		/>
	</FormField>
	<FormField label="Qui en est responsable ?">
		<PeopleChoice
			label="Responsable"
			people={store.members.items}
			selected={draft.ownerId ? [draft.ownerId] : []}
			meId={me.id}
			ontoggle={(id) => (draft.ownerId = draft.ownerId === id ? null : id)}
		/>
	</FormField>
	<FormField
		label="Découpe-la en Tasks"
		optional
		hint="Tu pourras en ajouter d’autres depuis la page de la Feat."
	>
		<LineList
			lines={draft.lines}
			placeholder="Tape une Task puis Entrée…"
			onchange={(lines) => (draft.lines = lines)}
		/>
	</FormField>
</FormDialog>
