<script lang="ts">
	import { useProject } from '$lib/client/context';
	import { decodeMentions, encodeMentions } from '$lib/client/refs/mentions';
	import type { Message } from '$lib/modules/discussion/domain/message';
	import type { ConvertKind, MessageView } from '$lib/ui/discussion';
	import MessageEditor from '$lib/ui/molecules/MessageEditor.svelte';
	import MessageItem from '$lib/ui/organisms/MessageItem.svelte';
	import { convertMessage } from './convert';

	interface Props {
		message: Message;
		view: MessageView;
		highlighted: boolean;
		onreply: (message: Message) => void;
		onjump: (ref: string) => void;
	}

	let { message, view, highlighted, onreply, onjump }: Props = $props();
	const { store, actions, refs, peek } = useProject();
	let editing = $state(false);
	let draft = $state('');

	function save() {
		const body = encodeMentions(draft.trim(), store.members.items);
		if (body && body !== message.body) actions.discussion.edit(message.id, body);
		editing = false;
	}

	async function convert(kind: ConvertKind) {
		const created = await convertMessage(actions, message, kind, store.members.items);
		if (created) peek(created.ref);
	}
</script>

<MessageItem
	{view}
	{highlighted}
	{onjump}
	resolve={refs.resolve}
	personName={refs.personName}
	editor={editing ? editor : undefined}
	onreply={() => onreply(message)}
	onquestion={(isQuestion) => actions.discussion.markQuestion(message.id, isQuestion)}
	onedit={() => ((draft = decodeMentions(message.body, store.members.items)), (editing = true))}
	ondelete={() => actions.discussion.remove(message.id)}
	onconvert={convert}
	onresolve={() => actions.discussion.resolveQuestion(message.id)}
/>

{#snippet editor()}
	<MessageEditor
		bind:value={draft}
		suggest={refs.suggest}
		onsave={save}
		oncancel={() => (editing = false)}
	/>
{/snippet}
