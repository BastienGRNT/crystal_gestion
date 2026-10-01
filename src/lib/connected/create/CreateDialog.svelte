<script lang="ts">
	import { untrack } from 'svelte';
	import { goto } from '$app/navigation';
	import { useProject } from '$lib/client/context';
	import { CREATE_KINDS, createKind, type CreateKind } from '$lib/client/create-kinds';
	import { overlays } from '$lib/client/overlays.svelte';
	import { toasts } from '$lib/client/toasts.svelte';
	import { parseQuickEntry } from '$lib/client/views/quick-entry';
	import Dialog from '$lib/ui/organisms/Dialog.svelte';
	import CreateFooter from '$lib/ui/organisms/create/CreateFooter.svelte';
	import EntryField from '$lib/ui/organisms/create/EntryField.svelte';
	import KindTabs from '$lib/ui/organisms/create/KindTabs.svelte';
	import CreateBody from './CreateBody.svelte';
	import CreateProps from './CreateProps.svelte';
	import { CREATED_LABEL, emptyDraft, resolveDraft, submitDraft } from './create-draft';
	import { tokenSuggestions } from './token-suggestions';

	const { store, actions, me, peek } = useProject();
	const opened = untrack(() => overlays.create!);
	let kind = $state<CreateKind>(opened.kind);
	let draft = $state(emptyDraft(opened.seed, me.id));
	let again = $state(false);
	const meta = $derived(createKind(kind));
	const parsed = $derived(
		parseQuickEntry(draft.text, {
			features: store.features.items,
			members: store.members.items,
			today: new Date()
		})
	);
	const shown = $derived(resolveDraft(draft, parsed));
	const close = () => (overlays.create = null);

	async function submit() {
		if (!parsed.title) return;
		const submitted = kind;
		const pending = submitDraft(kind, draft, parsed, actions, me.id);
		if (again) draft = { ...draft, text: '', body: '' };
		else close();
		const ref = await pending;
		if (!ref) return;
		const open = () =>
			submitted === 'feature' ? goto(`/p/${store.project.slug}/features/${ref}`) : peek(ref);
		toasts.show(`${ref} · ${CREATED_LABEL[submitted]}`, 'success', {
			action: { label: 'Ouvrir', run: open }
		});
	}

	function onkeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
			event.preventDefault();
			submit();
		}
	}
</script>

<Dialog label="Nouveau" width="max-w-[640px]" onclose={close}>
	<div {onkeydown} role="presentation">
		<KindTabs kinds={CREATE_KINDS} value={kind} onchange={(k) => (kind = k)} />
		<div class="px-5 pt-5 pb-1">
			<p class="mb-1 text-xs text-ink-3">{meta.hint}</p>
			<EntryField
				bind:value={draft.text}
				placeholder={meta.placeholder}
				suggest={(sigil, word) => tokenSuggestions(store, sigil, word)}
				onsubmit={submit}
			/>
		</div>
		<CreateBody {kind} bind:value={draft.body} />
		<CreateProps {kind} bind:draft {shown} />
		<CreateFooter
			hint={kind === 'feature'
				? 'Une ligne = une tâche. Tu pourras en ajouter depuis la page de la feature.'
				: 'Astuce : écris @Ana, #boutique, demain ou lundi directement dans le titre.'}
			{again}
			label={meta.label.toLowerCase()}
			disabled={!parsed.title}
			onagain={() => (again = !again)}
			onsubmit={submit}
		/>
	</div>
</Dialog>
