<script lang="ts">
	import { Download, Pencil, Reply, SquarePlus, Trash2 } from '@lucide/svelte';
	import { fileUrl } from '$lib/client/api';
	import { useApp } from '$lib/client/context';
	import { timeOf } from '$lib/client/format';
	import { toDisplay } from '$lib/client/mentions';
	import { plainText } from '$lib/client/rich-text';
	import type { MessageView } from '$lib/client/views/messages';
	import type { Channel, Message } from '$lib/modules/chat/domain/chat';
	import { fileKind, formatSize } from '$lib/modules/files/domain/file';
	import Avatar from '$lib/ui/atoms/Avatar.svelte';
	import FileIcon from '$lib/ui/atoms/FileIcon.svelte';
	import IconButton from '$lib/ui/atoms/IconButton.svelte';
	import TextArea from '$lib/ui/atoms/TextArea.svelte';
	import RichText from '$lib/ui/organisms/RichText.svelte';

	interface Props {
		view: MessageView;
		channel: Channel;
		highlighted?: boolean;
		onreply: (message: Message) => void;
	}

	let { view, channel, highlighted = false, onreply }: Props = $props();
	const { app, actions, overlays } = useApp();
	const message = $derived(view.message);
	const author = $derived(app.users.get(message.authorId));
	const mine = $derived(message.authorId === app.meId);
	const sending = $derived(app.pending.has(message.id));
	let editing = $state(false);
	let draft = $state('');

	const nameOf = (id: string) => app.users.get(id)?.name.split(' ')[0] ?? 'quelqu’un';
	const taskOf = (number: number) =>
		app.tasks.all.find((t) => t.projectId === channel.projectId && t.number === number);
	const original = $derived(message.replyToId ? app.messages.find(message.replyToId) : undefined);

	function toTask() {
		const text = plainText(toDisplay(message.body, app.users.all));
		overlays.newTask({
			projectId: channel.projectId,
			title: text.length > 120 ? `${text.slice(0, 117)}…` : text,
			notes: `${toDisplay(message.body, app.users.all)}\n\n— ${author?.name ?? 'Quelqu’un'}, dans la discussion`
		});
	}

	function save() {
		actions.chat.edit(message, draft);
		editing = false;
	}
</script>

<div
	id="message-{message.id}"
	class={[
		'group relative flex gap-3 rounded-lg px-4 transition-colors hover:bg-surface-2 sm:px-6',
		view.showAuthor ? 'mt-2 pt-2 pb-1' : 'py-0.5',
		highlighted && 'bg-accent-soft hover:bg-accent-soft',
		sending && 'opacity-60'
	]}
>
	<div class="w-9 shrink-0">
		{#if view.showAuthor && author}
			<Avatar name={author.name} color={author.color} size="md" class="mt-0.5" />
		{:else}
			<span class="hidden pt-1.5 text-right font-mono text-[11px] text-ink-4 group-hover:block"
				>{timeOf(message.createdAt)}</span
			>
		{/if}
	</div>
	<div class="min-w-0 flex-1">
		{#if view.showAuthor}
			<p class="flex items-baseline gap-2">
				<span class="text-base font-semibold">{author?.name ?? 'Ancien membre'}</span>
				<span class="font-mono text-xs text-ink-3">{timeOf(message.createdAt)}</span>
			</p>
		{/if}
		{#if original}
			<button
				onclick={() =>
					document.getElementById(`message-${original.id}`)?.scrollIntoView({ block: 'center' })}
				class="mt-1 mb-1 flex max-w-full items-center gap-2 border-l-[3px] border-line-strong pl-2.5 text-left text-sm text-ink-3 hover:text-ink-2"
			>
				<span class="shrink-0 font-semibold">{nameOf(original.authorId)}</span>
				<span class="truncate"
					>{plainText(toDisplay(original.body, app.users.all)) || 'Fichier joint'}</span
				>
			</button>
		{/if}
		{#if editing}
			<div class="mt-1 flex flex-col gap-2">
				<TextArea
					bind:value={draft}
					aria-label="Modifier le message"
					maxHeight={300}
					onkeydown={(e) => {
						if (e.key === 'Enter' && !e.shiftKey) {
							e.preventDefault();
							save();
						}
						if (e.key === 'Escape') editing = false;
					}}
					{@attach (node) => node.focus()}
				/>
				<p class="text-xs text-ink-3">Entrée pour enregistrer · Échap pour annuler</p>
			</div>
		{:else if message.body}
			<RichText
				body={message.body}
				meId={app.meId}
				{nameOf}
				{taskOf}
				onopentask={(id) => overlays.openTask(id)}
			/>
			{#if message.editedAt}<span class="text-xs text-ink-3">(modifié)</span>{/if}
		{/if}
		{#if message.attachments.length}
			<div class="mt-2 flex flex-wrap gap-2">
				{#each message.attachments as file (file.id)}
					{@const kind = fileKind(file.mime, file.name)}
					{#if kind === 'image'}
						<button
							onclick={() => (overlays.previewFileId = file.id)}
							class="overflow-hidden rounded-xl border border-line"
						>
							<img
								src={fileUrl(file.id)}
								alt={file.name}
								loading="lazy"
								class="max-h-64 max-w-[min(100%,420px)] object-cover"
							/>
						</button>
					{:else}
						<div
							class="flex max-w-80 items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2"
						>
							<FileIcon {kind} size={16} />
							<button
								class="min-w-0 flex-1 text-left"
								onclick={() => (overlays.previewFileId = file.id)}
							>
								<span class="block truncate text-base font-medium hover:underline">{file.name}</span
								>
								<span class="block text-xs text-ink-3">{formatSize(file.size)}</span>
							</button>
							<a
								href={fileUrl(file.id, true)}
								aria-label="Télécharger {file.name}"
								class="rounded-md p-1.5 text-ink-3 hover:bg-hover hover:text-ink"
								><Download size={16} /></a
							>
						</div>
					{/if}
				{/each}
			</div>
		{/if}
	</div>

	{#if !editing && !sending}
		<div
			class="absolute -top-3 right-4 hidden items-center rounded-lg border border-line bg-surface p-0.5 shadow-raise group-focus-within:flex group-hover:flex"
		>
			<IconButton icon={Reply} label="Répondre" size="sm" onclick={() => onreply(message)} />
			<IconButton icon={SquarePlus} label="En faire une tâche" size="sm" onclick={toTask} />
			{#if mine}
				<IconButton
					icon={Pencil}
					label="Modifier"
					size="sm"
					onclick={() => ((draft = toDisplay(message.body, app.users.all)), (editing = true))}
				/>
				<IconButton
					icon={Trash2}
					label="Supprimer"
					size="sm"
					tone="danger"
					onclick={() => actions.chat.remove(message)}
				/>
			{/if}
		</div>
	{/if}
</div>
