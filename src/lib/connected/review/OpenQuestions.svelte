<script lang="ts">
	import { useProject } from '$lib/client/context';
	import { timeAgo } from '$lib/client/format';
	import AvatarStack from '$lib/ui/molecules/AvatarStack.svelte';
	import RichText from '$lib/ui/molecules/RichText.svelte';

	const { store, refs } = useProject();
	const open = $derived(store.questions.items.filter((question) => !question.resolvedAt));
	const byMessage = $derived(
		[...new Set(open.map((question) => question.messageId))].map((messageId) => ({
			message: refs.findById(messageId),
			waitingFor: open
				.filter((q) => q.messageId === messageId)
				.map((q) => store.members.get(q.userId))
				.filter((m) => m !== undefined)
		}))
	);
</script>

{#each byMessage as { message, waitingFor } (message?.id)}
	{#if message}
		<a
			href={refs.href(message)}
			class="mb-2 flex items-start gap-3 rounded-lg border border-line bg-surface p-3 transition hover:border-line-strong"
		>
			<RichText text={message.title} resolve={refs.resolve} class="min-w-0 flex-1 text-base" />
			<span class="flex shrink-0 items-center gap-2 text-xs text-ink-3"
				>{timeAgo(message.createdAt)}<AvatarStack people={waitingFor} size={20} /></span
			>
		</a>
	{/if}
{:else}
	<p class="text-sm text-ink-3">Toutes les questions ont une réponse.</p>
{/each}
