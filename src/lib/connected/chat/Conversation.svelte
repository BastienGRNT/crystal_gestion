<script lang="ts">
	import { ArrowLeft, Ellipsis, Hash, Pencil, Trash2 } from '@lucide/svelte';
	import { onDestroy, untrack } from 'svelte';
	import { goto, replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import { useApp } from '$lib/client/context';
	import { channelName } from '$lib/client/views/workspace';
	import type { Channel, Message } from '$lib/modules/chat/domain/chat';
	import type { Project } from '$lib/modules/projects/domain/project';
	import Button from '$lib/ui/atoms/Button.svelte';
	import IconButton from '$lib/ui/atoms/IconButton.svelte';
	import IconLink from '$lib/ui/atoms/IconLink.svelte';
	import TextInput from '$lib/ui/atoms/TextInput.svelte';
	import Dialog from '$lib/ui/molecules/Dialog.svelte';
	import Menu from '$lib/ui/molecules/Menu.svelte';
	import DropZone from '../files/DropZone.svelte';
	import Composer from './Composer.svelte';
	import MessageList from './MessageList.svelte';
	import TypingIndicator from './TypingIndicator.svelte';

	let { channel, project }: { channel: Channel; project: Project } = $props();
	const { app, actions } = useApp();

	// Captured before marking as read, to place the "Nouveaux messages" line.
	const lastReadAt = untrack(() => {
		const state = app.channelStates.get(channel.id);
		return state?.unread ? state.lastReadAt : null;
	});
	const initial = untrack(() => page.url.searchParams.get('ecrire') ?? '');
	const highlight = $derived(page.url.searchParams.get('message'));
	let composer = $state<Composer>();
	let replyTo = $state<Message | null>(null);
	let renaming = $state(false);
	let newName = $state('');

	$effect(() => {
		const id = channel.id;
		untrack(() => {
			void app.messages.load(id);
			app.viewingChannel = id;
			actions.chat.markRead(id);
		});
	});

	$effect(() => {
		if (!initial) return;
		untrack(() => {
			const url = new URL(page.url);
			url.searchParams.delete('ecrire');
			replaceState(url, {});
			composer?.focus();
		});
	});

	onDestroy(() => {
		if (app.viewingChannel === channel.id) app.viewingChannel = null;
	});

	function reply(message: Message) {
		replyTo = message;
		composer?.focus();
	}
</script>

<svelte:window onfocus={() => actions.chat.markRead(channel.id)} />

<DropZone
	label="Lâche pour joindre à ton message"
	ondrop={(files) => composer?.attach(files)}
	class="flex min-h-0 flex-1 flex-col"
>
	<header class="flex h-16 shrink-0 items-center gap-3 border-b border-line px-4 sm:px-6">
		<IconLink
			href="/p/{project.slug}/discussion"
			icon={ArrowLeft}
			label="Tous les canaux"
			class="lg:hidden"
		/>
		<Hash size={20} class="shrink-0 text-ink-3" aria-hidden="true" />
		<div class="min-w-0 flex-1">
			<h1 class="truncate text-lg font-semibold tracking-tight">{channelName(channel)}</h1>
			<p class="truncate text-sm text-ink-3">
				{channel.kind === 'general' ? 'Tout le projet' : 'Un sujet du projet'} · {project.name}
			</p>
		</div>
		{#if channel.kind === 'custom'}
			<Menu
				label="Options du canal"
				items={[
					{
						label: 'Renommer',
						icon: Pencil,
						run: () => ((newName = channel.name), (renaming = true))
					},
					{
						label: 'Supprimer le canal et ses messages',
						icon: Trash2,
						danger: true,
						run: () =>
							actions.chat.removeChannel(channel.id, () => goto(`/p/${project.slug}/discussion`))
					}
				]}
			>
				{#snippet trigger({ props })}<IconButton
						icon={Ellipsis}
						label="Options du canal"
						{...props}
					/>{/snippet}
			</Menu>
		{/if}
	</header>
	<MessageList {channel} {lastReadAt} {highlight} onreply={reply} />
	<TypingIndicator channelId={channel.id} />
	<Composer bind:this={composer} {channel} {initial} bind:replyTo />
</DropZone>

<Dialog bind:open={renaming} size="sm" title="Renommer le canal">
	<form
		id="rename-channel"
		onsubmit={(e) => {
			e.preventDefault();
			actions.chat.renameChannel(channel.id, newName);
			renaming = false;
		}}
	>
		<TextInput bind:value={newName} aria-label="Nom du canal" required maxlength={40} autofocus />
	</form>
	{#snippet footer()}
		<Button variant="ghost" onclick={() => (renaming = false)}>Annuler</Button>
		<Button type="submit" form="rename-channel" variant="primary">Renommer</Button>
	{/snippet}
</Dialog>
