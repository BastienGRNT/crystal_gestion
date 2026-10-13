<script lang="ts">
	import { goto } from '$app/navigation';
	import { useApp } from '$lib/client/context';
	import { firstName } from '$lib/client/format';
	import { generalOf } from '$lib/client/views/workspace';
	import type { User } from '$lib/modules/identity/domain/user';
	import Avatar from '$lib/ui/atoms/Avatar.svelte';
	import Popover from '$lib/ui/molecules/Popover.svelte';
	import PersonCard from '$lib/ui/organisms/PersonCard.svelte';
	import { presenceFor, recentlyDone } from '../team/usePresence.svelte';

	let { user, projectId }: { user: User; projectId: string } = $props();
	const { app, overlays } = useApp();

	const presence = $derived(presenceFor(app, user, projectId));
	const line = $derived(
		presence.online && presence.working[0]
			? `Sur « ${presence.working[0].title} »`
			: presence.online && user.statusNote
				? user.statusNote
				: (presence.availability ?? presence.seen)
	);
	let open = $state(false);
	let anchor = $state<HTMLElement>();

	function openTask(id: string) {
		open = false;
		overlays.openTask(id);
	}
</script>

<button
	bind:this={anchor}
	onclick={() => (open = !open)}
	class="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-hover"
	aria-label="{user.name} : {presence.seen}, {line}"
>
	<Avatar
		name={user.name}
		color={user.color}
		size="md"
		dot={presence.statusDot}
		ring="ring-sidebar"
	/>
	<span class="min-w-0 flex-1">
		<span class="flex items-center gap-1.5 text-base font-medium text-ink">
			<span class="shrink-0">{firstName(user.name)}</span>
			{#if presence.online && user.status !== 'available'}
				<span class="truncate text-xs font-normal text-ink-3"
					>· {user.status === 'focus' ? 'ne pas déranger' : 'en pause'}</span
				>
			{/if}
		</span>
		<span class="block truncate text-sm text-ink-3">{line}</span>
	</span>
</button>

<Popover bind:open {anchor} placement="top-start" label={user.name} class="w-80 p-4">
	<PersonCard
		bare
		{user}
		{presence}
		recentDone={recentlyDone(app, user.id, projectId)}
		onopentask={(task) => openTask(task.id)}
		onassign={() => {
			open = false;
			overlays.newTask({ projectId, assigneeId: user.id });
		}}
		onmessage={() => {
			open = false;
			const general = generalOf(app.channels.all, projectId);
			const slug = app.projects.get(projectId)?.slug;
			if (general && slug)
				void goto(
					`/p/${slug}/discussion/${general.id}?ecrire=${encodeURIComponent(`@${firstName(user.name)} `)}`
				);
		}}
	/>
</Popover>
