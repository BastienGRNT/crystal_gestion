<script lang="ts">
	import { CheckCheck } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { useApp } from '$lib/client/context';
	import { firstName, relativeTime } from '$lib/client/format';
	import { now } from '$lib/client/now.svelte';
	import { notificationVerb, subjectHref } from '$lib/client/views/activity-text';
	import type { Notification } from '$lib/modules/activity/domain/activity';
	import type { Project } from '$lib/modules/projects/domain/project';
	import Avatar from '$lib/ui/atoms/Avatar.svelte';
	import Button from '$lib/ui/atoms/Button.svelte';

	let { project }: { project: Project } = $props();
	const { app, actions } = useApp();
	const items = $derived(
		app.notifications.all
			.filter((n) => n.projectId === project.id)
			.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
			.filter((n, i) => !n.readAt || i < 5)
			.slice(0, 10)
	);
	const unread = $derived(items.filter((n) => !n.readAt).length);

	function open(n: Notification) {
		actions.people.markNotificationsRead([n.id]);
		void goto(subjectHref(n.subject, project.slug));
	}
</script>

{#if items.length}
	<section aria-labelledby="for-you" class="flex flex-col gap-3">
		<header class="flex items-center gap-2">
			<h2 id="for-you" class="text-lg font-semibold tracking-tight">On t’a écrit</h2>
			{#if unread}<span
					class="rounded-full bg-accent px-2 text-xs leading-5 font-semibold text-accent-ink"
					>{unread}</span
				>{/if}
			{#if unread}
				<Button
					size="sm"
					variant="ghost"
					icon={CheckCheck}
					class="ml-auto"
					onclick={() => actions.people.markNotificationsRead('all', project.id)}>Tout lu</Button
				>
			{/if}
		</header>
		<ul
			class="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface shadow-card"
		>
			{#each items as n (n.id)}
				{@const actor = app.users.get(n.actorId)}
				<li>
					<button
						onclick={() => open(n)}
						class={[
							'flex w-full items-start gap-3 px-4 py-3.5 text-left hover:bg-surface-2',
							n.readAt && 'opacity-60'
						]}
					>
						{#if actor}<Avatar name={actor.name} color={actor.color} size="md" />{/if}
						<span class="min-w-0 flex-1">
							<span class="block text-base"
								><span class="font-semibold">{firstName(actor?.name ?? 'Quelqu’un')}</span>
								{notificationVerb(n)}</span
							>
							<span class="block truncate text-base text-ink-2">« {n.subject.title} »</span>
							<span class="block text-sm text-ink-3">{relativeTime(n.createdAt, now.value)}</span>
						</span>
						{#if !n.readAt}<span
								class="mt-2 size-2.5 shrink-0 rounded-full bg-accent"
								aria-label="Non lu"
							></span>{/if}
					</button>
				</li>
			{/each}
		</ul>
	</section>
{/if}
