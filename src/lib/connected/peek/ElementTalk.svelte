<script lang="ts">
	import { onMount } from 'svelte';
	import { SendHorizontal } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import { timeAgo } from '$lib/client/format';
	import { isDraft } from '$lib/client/live/optimistic';
	import { encodeMentions } from '$lib/client/refs/mentions';
	import RefTextArea from '$lib/ui/molecules/RefTextArea.svelte';
	import TalkList from '$lib/ui/organisms/TalkList.svelte';
	import { byCreatedAt, loadAbout } from '../discussion/thread-loader';

	interface Props {
		element: { id: string; ref: string };
		/** Where new messages go: the feature's thread, or Général. */
		featureId: string | null;
		/** People in charge (assignees, owner): mentioned by default so they get notified. */
		concerned?: string[];
	}

	/** Talk about this element right here; messages also land in the thread, linked with #ref. */
	let { element, featureId, concerned = [] }: Props = $props();
	const { store, actions, refs, me } = useProject();
	let draft = $state('');
	let notify = $state(true);
	const others = $derived(
		store.members.items.filter((m) => concerned.includes(m.id) && m.id !== me.id)
	);
	const prefix = $derived(`#${element.ref} `);
	const citing = $derived(new Set(refs.backlinks(element.id).map((e) => e.id)));
	const thread = $derived(store.features.get(featureId ?? '')?.title ?? 'Général');
	const messages = $derived(
		store.messages.items
			.filter((m) => citing.has(m.id) || (isDraft(m.id) && m.body.startsWith(prefix)))
			.sort(byCreatedAt)
			.map((m) => {
				const author = store.members.get(m.authorId);
				return {
					id: m.id,
					author: author ?? { name: 'Quelqu’un', color: 'var(--ink-3)' },
					body: m.body.startsWith(prefix) ? m.body.slice(prefix.length) : m.body,
					when: timeAgo(m.createdAt),
					// Named only when it is not the usual thread of this element.
					thread:
						m.featureId === featureId && !m.channelId
							? ''
							: (store.features.get(m.featureId ?? '')?.title ?? 'Général'),
					href: refs.href(m),
					pending: isDraft(m.id)
				};
			})
	);
	onMount(() => void loadAbout(store, element.id).catch(() => {}));

	function send() {
		const text = draft.trim();
		if (!text) return;
		const named = notify ? others.filter((p) => !text.includes(`@${p.name}`)) : [];
		const mentions = named.map((p) => `@${p.name} `).join('');
		const body = encodeMentions(`${prefix}${mentions}${text}`, store.members.items);
		actions.discussion.post({ featureId, channelId: null, body });
		draft = '';
	}
</script>

<section>
	<h3 class="mb-3 text-sm font-semibold">
		Discussion {#if messages.length}<span class="font-normal text-ink-3">{messages.length}</span
			>{/if}
	</h3>
	{#if messages.length}<TalkList
			{messages}
			resolve={refs.resolve}
			personName={refs.personName}
		/>{/if}
	<div
		class="mt-3 flex items-end gap-2 rounded-xl border border-line bg-surface p-2 focus-within:border-accent"
	>
		<RefTextArea
			bind:value={draft}
			suggest={refs.suggest}
			onsubmit={send}
			rows={1}
			placeholder="Écrire à propos de {element.ref}… (@ pour citer quelqu’un)"
			class="max-h-40 min-h-8 flex-1 resize-none bg-transparent px-1.5 py-1 text-sm outline-none placeholder:text-ink-3"
		/>
		<button
			type="button"
			onclick={send}
			disabled={!draft.trim()}
			aria-label="Envoyer"
			class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-ink disabled:opacity-40"
			><SendHorizontal size={15} /></button
		>
	</div>
	<div class="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-3">
		{#if others.length}
			<label class="flex items-center gap-1.5 text-ink-2">
				<input type="checkbox" bind:checked={notify} class="accent-[var(--accent)]" />
				Prévenir {others.map((p) => p.name).join(', ')}
			</label>
		{/if}
		<span>Aussi visible dans la discussion « {thread} ».</span>
	</div>
</section>
