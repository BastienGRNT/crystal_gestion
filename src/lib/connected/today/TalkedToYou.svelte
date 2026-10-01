<script lang="ts">
	import { goto } from '$app/navigation';
	import { useProject } from '$lib/client/context';
	import { timeAgo } from '$lib/client/format';
	import { NOTIFICATION_VERBS } from '$lib/modules/notifications/domain/notification';
	import Avatar from '$lib/ui/atoms/Avatar.svelte';
	import Card from '$lib/ui/molecules/Card.svelte';
	import QuestionsForMe from './QuestionsForMe.svelte';

	/** Who reached out: open questions first (answer inline), then unread mentions and assignments. */
	const { store, refs, me } = useProject();
	const questions = $derived(
		store.questions.items.filter((q) => q.userId === me.id && !q.resolvedAt).length
	);
	const unread = $derived(
		store.notifications.items
			.filter((n) => !n.readAt && n.type !== 'question')
			.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
			.slice(0, 6)
	);
</script>

<Card title="On t’a parlé">
	{#if questions}<QuestionsForMe />{/if}
	{#each unread as notification (notification.id)}
		{@const actor = store.members.get(notification.actorId)}
		<button
			type="button"
			onclick={() =>
				goto(refs.href({ ref: notification.elementRef, kind: notification.elementKind }))}
			class="-mx-2 flex w-[calc(100%+1rem)] items-start gap-2.5 rounded-lg px-2 py-2 text-left hover:bg-hover"
		>
			<Avatar name={actor?.name ?? '?'} color={actor?.color ?? 'var(--ink-3)'} size={22} />
			<span class="min-w-0 flex-1 text-ui leading-snug">
				<span class="font-medium">{actor?.name ?? 'Quelqu’un'}</span>
				<span class="text-ink-2">{NOTIFICATION_VERBS[notification.type]}</span>
				<span class="block truncate text-ink-2">{notification.elementTitle}</span>
			</span>
			<span class="shrink-0 text-xs text-ink-3">{timeAgo(notification.createdAt)}</span>
		</button>
	{/each}
	{#if !questions && !unread.length}
		<p class="text-ui text-ink-3">
			Personne ne t’attend. Pour parler d’une tâche, ouvre-la : la discussion est en bas.
		</p>
	{/if}
</Card>
