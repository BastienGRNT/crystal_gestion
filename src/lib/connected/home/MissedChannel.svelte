<script lang="ts">
	import { ArrowUpRight, Check, CornerDownLeft, Hash, MessageSquare } from '@lucide/svelte';
	import { untrack } from 'svelte';
	import { useApp } from '$lib/client/context';
	import { firstName, plural, timeOf } from '$lib/client/format';
	import { unreadMessages } from '$lib/client/views/catch-up';
	import { channelName } from '$lib/client/views/workspace';
	import { excerpt, type Channel, type ChannelState } from '$lib/modules/chat/domain/chat';
	import type { Project } from '$lib/modules/projects/domain/project';
	import Avatar from '$lib/ui/atoms/Avatar.svelte';
	import Button from '$lib/ui/atoms/Button.svelte';

	interface Props {
		channel: Channel;
		status: ChannelState;
		project: Project;
	}

	let { channel, status, project }: Props = $props();
	const { app, actions, overlays } = useApp();
	const messages = $derived(app.messages.of(channel.id));
	const latest = $derived(unreadMessages(messages.items, status.lastReadAt, app.meId));
	const more = $derived(Math.max(0, status.unread - latest.length));
	const task = $derived(channel.taskId ? app.tasks.get(channel.taskId) : undefined);
	const names = $derived(new Map(app.users.all.map((u) => [u.id, firstName(u.name)])));
	const label = $derived(task ? `#${task.number} ${task.title}` : channelName(channel));
	let reply = $state('');
	let sending = $state(false);

	// The missed messages themselves, not only a count: most of the time that is enough.
	$effect(() => {
		const id = channel.id;
		untrack(() => void app.messages.load(id));
	});

	function open() {
		if (channel.taskId) overlays.openTask(channel.taskId);
	}

	async function send(event: SubmitEvent) {
		event.preventDefault();
		if (!reply.trim() || sending) return;
		sending = true;
		const ok = channel.taskId
			? await actions.chat.comment(channel.taskId, reply)
			: await actions.chat.post(channel.id, reply);
		sending = false;
		if (!ok) return;
		reply = '';
		actions.chat.markRead(channel.id);
	}
</script>

<article
	aria-label={label}
	class="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 shadow-card"
>
	<header class="flex flex-wrap items-center gap-x-2 gap-y-1">
		{#if task}<MessageSquare size={16} class="text-ink-3" aria-hidden="true" />{:else}<Hash
				size={16}
				class="text-ink-3"
				aria-hidden="true"
			/>{/if}
		<span class="min-w-0 truncate text-md font-semibold">{label}</span>
		<span class="text-sm text-ink-3">{plural(status.unread, 'nouveau', 'nouveaux')}</span>
		{#if status.mentions}<span
				class="rounded-full bg-accent px-2 text-xs leading-5 font-semibold text-accent-ink"
				>@ {status.mentions === 1 ? 'toi' : `toi ×${status.mentions}`}</span
			>{/if}
		<span class="ml-auto flex gap-1">
			<Button
				size="sm"
				variant="ghost"
				icon={ArrowUpRight}
				href={task ? undefined : `/p/${project.slug}/discussion/${channel.id}`}
				onclick={task ? open : undefined}>Ouvrir</Button
			>
			<Button
				size="sm"
				variant="ghost"
				icon={Check}
				onclick={() => actions.chat.markRead(channel.id)}>Lu</Button
			>
		</span>
	</header>

	<ol class="flex flex-col gap-2.5">
		{#each latest as message (message.id)}
			{@const author = app.users.get(message.authorId)}
			{@const forMe = message.body.includes(`<@${app.meId}>`)}
			<li class="flex gap-2.5">
				{#if author}<Avatar name={author.name} color={author.color} size="sm" class="mt-0.5" />{/if}
				<p class="min-w-0 flex-1 text-base">
					<span class="font-semibold">{firstName(author?.name ?? '?')}</span>
					<span class="text-sm text-ink-3">{timeOf(message.createdAt)}</span>
					<span
						class={[
							'line-clamp-2 break-words',
							forMe ? 'rounded-md bg-accent-soft px-1.5 text-ink' : 'text-ink-2'
						]}>{excerpt(message.body, names, 220)}</span
					>
				</p>
			</li>
		{:else}
			<li class="text-sm text-ink-3">Chargement…</li>
		{/each}
		{#if more}<li class="pl-8 text-sm text-ink-3">et {plural(more, 'message')} avant</li>{/if}
	</ol>

	<!-- Answering from here is often all it takes: the channel is then read. -->
	<form onsubmit={send} class="relative">
		<input
			bind:value={reply}
			placeholder={task ? 'Répondre en commentaire…' : `Répondre dans #${channelName(channel)}…`}
			aria-label="Répondre"
			class="h-11 w-full rounded-xl border border-line-strong/70 bg-surface-2 pr-12 pl-3.5 text-base outline-none placeholder:text-ink-4 focus:border-accent focus:bg-surface focus:ring-4 focus:ring-accent-soft"
		/>
		<button
			type="submit"
			disabled={!reply.trim() || sending}
			aria-label="Envoyer"
			class="absolute top-1/2 right-1.5 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-ink-3 enabled:hover:bg-hover enabled:hover:text-ink disabled:opacity-40"
		>
			<CornerDownLeft size={16} />
		</button>
	</form>
</article>
