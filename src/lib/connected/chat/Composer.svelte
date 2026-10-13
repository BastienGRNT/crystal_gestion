<script lang="ts">
	import { MessageCircleQuestion, Paperclip, SendHorizontal, X } from '@lucide/svelte';
	import { tick, untrack } from 'svelte';
	import { useApp } from '$lib/client/context';
	import { channelName } from '$lib/client/views/workspace';
	import type { Channel, Message } from '$lib/modules/chat/domain/chat';
	import { toDisplay } from '$lib/client/mentions';
	import { plainText } from '$lib/client/rich-text';
	import type { StoredFile } from '$lib/modules/files/domain/file';
	import { plural } from '$lib/client/format';
	import Avatar from '$lib/ui/atoms/Avatar.svelte';
	import Spinner from '$lib/ui/atoms/Spinner.svelte';
	import IconButton from '$lib/ui/atoms/IconButton.svelte';
	import QuestionHint from './QuestionHint.svelte';
	import { suggestionsFor, tokenBefore, type Suggestion } from './suggestions';

	interface Props {
		channel: Channel;
		initial?: string;
		replyTo?: Message | null;
	}

	let { channel, initial = '', replyTo = $bindable(null) }: Props = $props();
	const { app, actions, realtime } = useApp();

	let text = $state(untrack(() => initial));
	let attached = $state<StoredFile[]>([]);
	let input = $state<HTMLTextAreaElement>();
	let picker = $state<HTMLInputElement>();
	let caret = $state(0);
	let selected = $state(0);
	let lastTyping = 0;

	const token = $derived(tokenBefore(text, caret));
	const projectTasks = $derived(app.tasks.all.filter((t) => t.projectId === channel.projectId));
	const suggestions = $derived(token ? suggestionsFor(token, app.users.all, projectTasks) : []);
	let uploading = $state(0);
	const canSend = $derived((text.trim().length > 0 || attached.length > 0) && uploading === 0);
	/** The oldest question here someone waits for me to answer. */
	const waiting = $derived(
		app.questions.all
			.filter((q) => q.channelId === channel.id && q.asks.includes(app.meId))
			.sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0]
	);

	$effect(() => {
		void text;
		if (!input) return;
		input.style.height = 'auto';
		input.style.height = `${Math.min(input.scrollHeight, 220)}px`;
	});

	export async function focus() {
		await tick();
		input?.focus();
		input?.setSelectionRange(text.length, text.length);
		caret = text.length;
	}

	async function pick(suggestion: Suggestion) {
		if (!token) return;
		text = text.slice(0, token.start) + suggestion.insert + text.slice(caret);
		const position = token.start + suggestion.insert.length;
		await tick();
		input?.setSelectionRange(position, position);
		caret = position;
		input?.focus();
	}

	export async function attach(files: File[]) {
		uploading += files.length;
		await Promise.all(
			files.map(async (file) => {
				const stored = await actions.files.upload(file, channel.projectId, null, true);
				if (stored) attached = [...attached, stored];
				uploading--;
			})
		);
	}

	async function send() {
		if (!canSend) return;
		const body = text;
		const fileIds = attached.map((f) => f.id);
		const answering = replyTo;
		text = '';
		const previous = attached;
		attached = [];
		replyTo = null;
		if (!(await actions.chat.post(channel.id, body, fileIds, answering?.id ?? null))) {
			text = body;
			attached = previous;
			replyTo = answering;
		}
	}

	function onkeydown(event: KeyboardEvent) {
		if (suggestions.length && ['ArrowDown', 'ArrowUp', 'Enter', 'Tab'].includes(event.key)) {
			event.preventDefault();
			if (event.key === 'ArrowDown') selected = (selected + 1) % suggestions.length;
			else if (event.key === 'ArrowUp')
				selected = (selected - 1 + suggestions.length) % suggestions.length;
			else void pick(suggestions[selected]);
			return;
		}
		if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
			event.preventDefault();
			void send();
		}
	}

	function oninput() {
		caret = input?.selectionStart ?? 0;
		selected = 0;
		// Tells the others "is typing", at most every 3 s.
		if (Date.now() - lastTyping > 3000) {
			lastTyping = Date.now();
			realtime.send({ type: 'typing', channelId: channel.id, projectId: channel.projectId });
		}
	}
</script>

<div class="relative px-4 pb-4 sm:px-6">
	{#if suggestions.length}
		<ul
			class="absolute right-4 bottom-full left-4 mb-1 max-h-64 overflow-y-auto rounded-xl border border-line bg-surface p-1 shadow-pop sm:right-6 sm:left-6"
			role="listbox"
		>
			{#each suggestions as suggestion, i (suggestion.key)}
				<li>
					<button
						role="option"
						aria-selected={i === selected}
						onmousedown={(e) => (e.preventDefault(), pick(suggestion))}
						class={[
							'flex h-10 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-base',
							i === selected && 'bg-active'
						]}
					>
						{#if suggestion.color !== undefined}<Avatar
								name={suggestion.label}
								color={suggestion.color}
								size="sm"
							/>{/if}
						{#if suggestion.detail}<span class="font-mono text-sm text-ink-3"
								>{suggestion.detail}</span
							>{/if}
						<span class="truncate">{suggestion.label}</span>
					</button>
				</li>
			{/each}
		</ul>
	{/if}

	{#if waiting && !replyTo}
		<div
			class="mb-2 flex items-center gap-2 rounded-xl bg-warn-soft px-3.5 py-2 text-sm text-warn-text"
		>
			<MessageCircleQuestion size={15} class="shrink-0" aria-hidden="true" />
			<span class="shrink-0 font-semibold"
				>{app.users.get(waiting.authorId)?.name.split(' ')[0]} attend ta réponse :</span
			>
			<span class="min-w-0 flex-1 truncate"
				>{plainText(toDisplay(waiting.body, app.users.all))}</span
			>
			<button
				class="shrink-0 font-semibold hover:underline"
				onclick={() => ((replyTo = waiting), focus())}>Répondre</button
			>
		</div>
	{/if}

	<div
		class="rounded-2xl border border-line-strong/70 bg-surface shadow-card focus-within:border-accent focus-within:ring-4 focus-within:ring-accent-soft"
	>
		{#if replyTo}
			<div class="flex items-center gap-2 border-b border-line px-3.5 py-2 text-sm text-ink-3">
				<span class="shrink-0"
					>Réponse à <span class="font-semibold text-ink-2"
						>{app.users.get(replyTo.authorId)?.name.split(' ')[0]}</span
					> :</span
				>
				<span class="min-w-0 flex-1 truncate"
					>{plainText(toDisplay(replyTo.body, app.users.all))}</span
				>
				<button
					aria-label="Ne plus répondre"
					class="rounded p-1 hover:bg-hover hover:text-ink"
					onclick={() => (replyTo = null)}><X size={14} /></button
				>
			</div>
		{/if}
		{#if attached.length || uploading}
			<div class="flex flex-wrap gap-1.5 px-3 pt-3">
				{#each attached as file (file.id)}
					<span
						class="inline-flex max-w-60 items-center gap-1.5 rounded-lg bg-sunken py-1 pr-1 pl-2.5 text-sm"
					>
						<span class="truncate">{file.name}</span>
						<button
							aria-label="Retirer {file.name}"
							class="rounded p-0.5 text-ink-3 hover:bg-hover hover:text-ink"
							onclick={() => (attached = attached.filter((f) => f.id !== file.id))}
						>
							<X size={14} />
						</button>
					</span>
				{/each}
				{#if uploading}
					<span
						class="inline-flex items-center gap-2 rounded-lg bg-sunken px-2.5 py-1 text-sm text-ink-3"
					>
						<Spinner size={13} /> Envoi de {plural(uploading, 'fichier')}…
					</span>
				{/if}
			</div>
		{/if}
		<div class="flex items-end gap-1 p-1.5">
			<IconButton icon={Paperclip} label="Joindre un fichier" onclick={() => picker?.click()} />
			<input
				bind:this={picker}
				type="file"
				multiple
				hidden
				onchange={(e) => (attach([...(e.currentTarget.files ?? [])]), (e.currentTarget.value = ''))}
			/>
			<textarea
				bind:this={input}
				bind:value={text}
				rows="1"
				{onkeydown}
				{oninput}
				onclick={() => (caret = input?.selectionStart ?? 0)}
				onpaste={(e) => {
					const files = [...(e.clipboardData?.files ?? [])];
					if (!files.length) return;
					e.preventDefault();
					void attach(files);
				}}
				aria-label="Message"
				placeholder="Écrire dans #{channelName(channel)}…  (@ pour mentionner, # pour une tâche)"
				class="max-h-[220px] min-h-10 flex-1 resize-none bg-transparent px-1.5 py-2 text-md outline-none placeholder:text-ink-4"
			></textarea>
			<button
				onclick={send}
				disabled={!canSend}
				aria-label="Envoyer"
				class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-ink transition-opacity disabled:opacity-25"
			>
				<SendHorizontal size={17} />
			</button>
		</div>
	</div>
	<div class="mt-1.5">
		<QuestionHint {text} projectId={channel.projectId}>
			<p class="hidden px-1 text-xs text-ink-3 sm:block">
				Entrée pour envoyer · Maj + Entrée pour aller à la ligne · colle une capture pour la joindre
			</p>
		</QuestionHint>
	</div>
</div>
