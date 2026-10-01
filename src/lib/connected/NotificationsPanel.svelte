<script lang="ts">
	import { goto } from '$app/navigation';
	import { BellOff } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import { timeAgo } from '$lib/client/format';
	import { overlays } from '$lib/client/overlays.svelte';
	import { NOTIFICATION_VERBS } from '$lib/modules/notifications/domain/notification';
	import Avatar from '$lib/ui/atoms/Avatar.svelte';
	import EmptyState from '$lib/ui/molecules/EmptyState.svelte';
	import Drawer from '$lib/ui/organisms/Drawer.svelte';

	const { store, actions, refs } = useProject();
	const items = $derived(
		[...store.notifications.items].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
	);
	$effect(() => {
		const timer = setTimeout(() => actions.project.markNotificationsRead(), 1500);
		return () => clearTimeout(timer);
	});

	function open(ref: string, kind: Parameters<typeof refs.href>[0]['kind']) {
		overlays.notifications = false;
		goto(refs.href({ ref, kind }));
	}
</script>

<Drawer onclose={() => (overlays.notifications = false)}>
	{#snippet header()}<p class="font-medium">Notifications</p>{/snippet}
	{#each items as notification (notification.id)}
		{@const actor = store.members.get(notification.actorId)}
		<button
			class="flex w-full gap-3 rounded-lg px-2 py-2.5 text-left transition hover:bg-sunken"
			onclick={() => open(notification.elementRef, notification.elementKind)}
		>
			{#if actor}<Avatar name={actor.name} color={actor.color} size={28} />{/if}
			<span class="min-w-0 flex-1 text-sm">
				<span class="font-medium">{actor?.name ?? 'Quelqu’un'}</span>
				{NOTIFICATION_VERBS[notification.type]}
				<span class="font-mono text-xs text-ink-3">{notification.elementRef}</span>
				<span class="block truncate text-ink-2">{notification.elementTitle}</span>
				<span class="text-xs text-ink-3">{timeAgo(notification.createdAt)}</span>
			</span>
			{#if !notification.readAt}<span class="mt-1.5 size-2 shrink-0 rounded-full bg-accent"
				></span>{/if}
		</button>
	{:else}
		<EmptyState
			icon={BellOff}
			title="Rien de neuf"
			text="Tu seras prévenu·e seulement pour les mentions, les questions et les Tasks qu’on t’assigne."
		/>
	{/each}
</Drawer>
