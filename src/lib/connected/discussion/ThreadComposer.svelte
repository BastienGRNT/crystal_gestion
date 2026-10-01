<script lang="ts">
	import { untrack } from 'svelte';
	import { useProject } from '$lib/client/context';
	import { encodeMentions } from '$lib/client/refs/mentions';
	import { extractMentions } from '$lib/modules/discussion/domain/mentions';
	import type { Message } from '$lib/modules/discussion/domain/message';
	import Composer from '$lib/ui/organisms/Composer.svelte';

	interface Props {
		featureId: string | null;
		channelId: string | null;
		placeholder: string;
		replyTo: Message | null;
	}

	let { featureId, channelId, placeholder, replyTo = $bindable() }: Props = $props();
	const { store, actions, refs, me } = useProject();
	let text = $state('');
	let question = $state(false);
	let element = $state<HTMLTextAreaElement>();
	const body = $derived(encodeMentions(text.trim(), store.members.items));
	const canAsk = $derived(extractMentions(body).some((id) => id !== me.id));
	const replyingTo = $derived(
		replyTo && {
			author: store.members.get(replyTo.authorId)?.name ?? 'Quelqu’un',
			excerpt: replyTo.title
		}
	);

	$effect(() => {
		if (replyTo) untrack(() => element?.focus());
	});

	async function send() {
		if (!body) return;
		const input = {
			featureId,
			channelId,
			body,
			replyToId: replyTo?.id ?? null,
			isQuestion: question && canAsk
		};
		const typed = text;
		[text, question, replyTo] = ['', false, null];
		if (!(await actions.discussion.post(input))) text = typed;
	}
</script>

<Composer
	bind:value={text}
	bind:question
	bind:element
	{canAsk}
	{placeholder}
	{replyingTo}
	suggest={refs.suggest}
	onsubmit={send}
	oncancelreply={() => (replyTo = null)}
/>
