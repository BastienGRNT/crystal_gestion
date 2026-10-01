<script lang="ts">
	import { untrack } from 'svelte';
	import { goto } from '$app/navigation';
	import { useProject } from '$lib/client/context';
	import { CREATE_KINDS, createKind, type CreateKind } from '$lib/client/create-kinds';
	import { overlays } from '$lib/client/overlays.svelte';
	import { toasts } from '$lib/client/toasts.svelte';
	import Dialog from '$lib/ui/organisms/Dialog.svelte';
	import CreateFooter from '$lib/ui/organisms/create/CreateFooter.svelte';
	import KindTabs from '$lib/ui/organisms/create/KindTabs.svelte';
	import CreateFields from './CreateFields.svelte';
	import { CREATED_LABEL, emptyDraft, submitDraft } from './create-draft';

	const { store, actions, me, peek } = useProject();
	const opened = untrack(() => overlays.create!);
	let kind = $state<CreateKind>(opened.kind);
	let draft = $state(emptyDraft(opened.seed, me.id));
	let again = $state(false);
	const meta = $derived(createKind(kind));
	const close = () => (overlays.create = null);

	async function submit() {
		if (!draft.title.trim()) return;
		const submitted = kind;
		const pending = submitDraft(kind, draft, actions, me.id);
		if (again) draft = { ...draft, title: '', rationale: '', problem: '', cause: '', solution: '' };
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
		if (event.key !== 'Enter') return;
		const inTitle = event.target instanceof HTMLInputElement && event.target.name === 'title';
		if ((inTitle && !event.shiftKey) || event.metaKey || event.ctrlKey) {
			event.preventDefault();
			submit();
		}
	}
</script>

<Dialog label="Créer" onclose={close}>
	<div {onkeydown} role="presentation">
		<div class="px-3 pt-3">
			<KindTabs kinds={CREATE_KINDS} value={kind} onchange={(k) => (kind = k)} />
		</div>
		<div class="px-[18px] pt-4 pb-1.5">
			<!-- svelte-ignore a11y_autofocus -->
			<input
				name="title"
				bind:value={draft.title}
				autofocus
				placeholder={meta.placeholder}
				class="w-full bg-transparent py-1 text-xl font-medium tracking-[-0.01em] outline-none placeholder:text-ink-3"
			/>
		</div>
		<CreateFields {kind} bind:draft />
		<CreateFooter
			{again}
			label={meta.label.toLowerCase()}
			disabled={!draft.title.trim()}
			onagain={() => (again = !again)}
			onsubmit={submit}
		/>
	</div>
</Dialog>
