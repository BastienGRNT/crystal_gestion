<script lang="ts">
	import { useProject } from '$lib/client/context';
	import { timeAgo } from '$lib/client/format';
	import QuestionList from '$lib/ui/organisms/today/QuestionList.svelte';
	import type { QuestionView } from '$lib/ui/types';

	const { store, refs, actions, me } = useProject();
	const items = $derived(
		store.questions.items
			.filter((question) => question.userId === me.id && !question.resolvedAt)
			.map((question): QuestionView | null => {
				const message = refs.findById(question.messageId);
				if (!message) return null;
				const author = store.members.get(message.createdBy ?? '');
				return {
					id: question.messageId,
					author: author ?? { name: 'Quelqu’un', color: '#8b8894' },
					excerpt: message.title,
					href: refs.href(message),
					when: timeAgo(message.createdAt)
				};
			})
			.filter((item): item is QuestionView => item !== null)
	);
</script>

{#if items.length}
	<QuestionList
		{items}
		resolve={refs.resolve}
		onresolve={(messageId) => actions.discussion.resolveQuestion(messageId)}
		onreply={(replyToId, body) =>
			actions.discussion.post({ featureId: null, channelId: null, body, replyToId })}
	/>
{:else}
	<p class="text-ui text-ink-3">
		Aucune question en attente. Quand quelqu’un te pose une question avec @, elle arrive ici.
	</p>
{/if}
