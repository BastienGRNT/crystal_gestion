<script lang="ts">
	import { untrack } from 'svelte';
	import { SquareCheckBig, Wrench } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import { overlays } from '$lib/client/overlays.svelte';
	import { dueChoices } from '$lib/client/views/due-choices';
	import { parseQuickEntry } from '$lib/client/views/quick-entry';
	import { openFeats } from '$lib/client/views/open-feats';
	import ChoiceCards from '$lib/ui/molecules/form/ChoiceCards.svelte';
	import EntryField from '$lib/ui/molecules/form/EntryField.svelte';
	import FeatChoice from '$lib/ui/molecules/form/FeatChoice.svelte';
	import FormField from '$lib/ui/molecules/form/FormField.svelte';
	import PeopleChoice from '$lib/ui/molecules/form/PeopleChoice.svelte';
	import TextField from '$lib/ui/molecules/form/TextField.svelte';
	import WhenChoice from '$lib/ui/molecules/form/WhenChoice.svelte';
	import FormDialog from '$lib/ui/organisms/FormDialog.svelte';
	import { emptyDraft, resolveDraft, submitTask } from './create-draft';
	import { created } from './created';
	import { tokenSuggestions } from './token-suggestions';

	const { store, actions, me } = useProject();
	const opened = untrack(() => overlays.create!);
	let draft = $state(emptyDraft(opened.seed, me.id, opened.kind === 'fix'));
	const parsed = $derived(
		parseQuickEntry(draft.title, {
			features: store.features.items,
			members: store.members.items,
			today: new Date()
		})
	);
	const shown = $derived(resolveDraft(draft, parsed));
	const kind = $derived(draft.isFix ? 'Fix' : 'Task');
	const toggle = (ids: string[], id: string) =>
		ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
	const close = () => (overlays.create = null);

	async function submit() {
		if (!parsed.title) return;
		close();
		created(await submitTask(draft, parsed, actions), draft.isFix ? 'Fix créé' : 'Task créée');
	}
</script>

<FormDialog
	title={draft.isFix ? 'Nouveau Fix' : 'Nouvelle Task'}
	submitLabel={draft.isFix ? 'Créer le Fix' : 'Créer la Task'}
	disabled={!parsed.title}
	note="Astuce : « @Ana demain » dans le titre remplit les champs."
	onsubmit={submit}
	onclose={close}
>
	{#snippet lead()}
		{#if draft.isFix}<Wrench size={22} class="text-must" />{:else}<SquareCheckBig
				size={22}
				class="text-ink-3"
			/>{/if}
	{/snippet}
	<FormField label={draft.isFix ? 'Qu’est-ce qu’il faut corriger ?' : 'Que faut-il faire ?'}>
		<EntryField
			bind:value={draft.title}
			placeholder={draft.isFix
				? 'Ex. Le panier se vide au rafraîchissement'
				: 'Ex. Maquetter la page produit'}
			suggest={(sigil, word) => tokenSuggestions(store, sigil, word)}
			onsubmit={submit}
		/>
	</FormField>
	<FormField label="C’est…">
		<ChoiceCards
			label="Type"
			value={kind}
			onchange={(v) => (draft.isFix = v === 'Fix')}
			choices={[
				{ value: 'Task', label: 'Une Task', hint: 'Quelque chose à faire', icon: SquareCheckBig },
				{
					value: 'Fix',
					label: 'Un Fix',
					hint: 'Quelque chose à corriger',
					icon: Wrench,
					color: 'var(--must)'
				}
			]}
		/>
	</FormField>
	<FormField label="Dans quelle Feat ?">
		<FeatChoice
			feats={openFeats(store.features.items)}
			value={shown.featureId}
			onchange={(id) => (draft.featureId = id)}
		/>
	</FormField>
	<FormField label="Qui s’en occupe ?">
		<PeopleChoice
			label="Qui s’en occupe"
			people={store.members.items}
			selected={shown.assigneeIds}
			meId={me.id}
			ontoggle={(id) => (draft.assigneeIds = toggle(shown.assigneeIds, id))}
		/>
	</FormField>
	<FormField label="Pour quand ?">
		<WhenChoice
			choices={dueChoices(new Date()).map((c) => (c.value ? c : { ...c, label: 'Pas de date' }))}
			value={shown.dueDate}
			onchange={(date) => (draft.dueDate = date)}
		/>
	</FormField>
	<FormField
		label="Qui valide ?"
		optional
		hint="Avec un valideur, cocher la {kind} l’envoie « À valider » chez lui. Sans, elle passe en Fait."
	>
		<PeopleChoice
			label="Qui valide"
			people={store.members.items}
			selected={draft.reviewerId ? [draft.reviewerId] : []}
			meId={me.id}
			ontoggle={(id) => (draft.reviewerId = draft.reviewerId === id ? null : id)}
			none={{
				label: 'Personne',
				active: !draft.reviewerId,
				onpick: () => (draft.reviewerId = null)
			}}
		/>
	</FormField>
	<FormField label="Détails" optional>
		<TextField
			bind:value={draft.body}
			rows={3}
			placeholder={draft.isFix ? 'Comment le reproduire ?' : 'Ce qu’il faut savoir pour s’y mettre'}
		/>
	</FormField>
</FormDialog>
