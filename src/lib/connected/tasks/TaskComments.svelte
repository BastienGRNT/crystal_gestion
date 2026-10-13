<script lang="ts">
	import { SendHorizontal } from '@lucide/svelte';
	import { untrack } from 'svelte';
	import { useApp } from '$lib/client/context';
	import { elapsed, firstName, joinNames, relativeTime } from '$lib/client/format';
	import { now } from '$lib/client/now.svelte';
	import { threadOf } from '$lib/client/views/workspace';
	import type { Task } from '$lib/modules/tasks/domain/task';
	import Avatar from '$lib/ui/atoms/Avatar.svelte';
	import QuestionTag from '$lib/ui/atoms/QuestionTag.svelte';
	import RichText from '$lib/ui/organisms/RichText.svelte';
	import QuestionHint from '../chat/QuestionHint.svelte';

	let { task }: { task: Task } = $props();
	const { app, actions, overlays } = useApp();
	const thread = $derived(threadOf(app.channels.all, task.id));
	const store = $derived(thread ? app.messages.of(thread.id) : null);
	let text = $state('');
	let sending = $state(false);
	let input = $state<HTMLTextAreaElement>();

	$effect(() => {
		const id = thread?.id;
		if (!id) return;
		untrack(() => {
			void app.messages.load(id);
			actions.chat.markRead(id);
		});
	});

	const nameOf = (id: string) => firstName(app.users.get(id)?.name ?? 'quelqu’un');
	const asked = (ids: string[]) => joinNames(ids.map(nameOf));
	const taskOf = (number: number) =>
		app.tasks.all.find((t) => t.projectId === task.projectId && t.number === number);

	async function send() {
		if (!text.trim() || sending) return;
		sending = true;
		if (await actions.chat.comment(task.id, text)) text = '';
		sending = false;
	}
</script>

<div class="flex flex-col gap-3">
	{#if store?.items.length}
		<ol class="flex flex-col gap-4">
			{#each store.items as message (message.id)}
				{@const author = app.users.get(message.authorId)}
				<li class="flex gap-3">
					{#if author}<Avatar name={author.name} color={author.color} size="md" />{/if}
					<div class="min-w-0 flex-1">
						<p class="text-sm">
							<span class="font-semibold">{author?.name ?? '?'}</span>
							<span class="text-ink-3">{relativeTime(message.createdAt, now.value)}</span>
						</p>
						<RichText
							body={message.body}
							meId={app.meId}
							{nameOf}
							{taskOf}
							onopentask={(id) => overlays.openTask(id)}
						/>
						{#if message.asks.length}
							{@const forMe = message.asks.includes(app.meId)}
							<!-- Here any comment of theirs answers: replying means writing below. -->
							<QuestionTag
								names={asked(message.asks)}
								answered={!!message.answeredAt}
								{forMe}
								waited={message.answeredAt ? undefined : elapsed(message.createdAt, now.value)}
								onreply={forMe ? () => input?.focus() : undefined}
								onresolve={forMe || message.authorId === app.meId
									? () => actions.chat.resolve(message)
									: undefined}
							/>
						{/if}
					</div>
				</li>
			{/each}
		</ol>
	{/if}
	<div
		class="flex items-end gap-2 rounded-xl border border-line-strong/70 bg-surface p-1.5 focus-within:border-accent focus-within:ring-4 focus-within:ring-accent-soft"
	>
		<textarea
			bind:this={input}
			bind:value={text}
			rows="1"
			aria-label="Commentaire"
			placeholder="Une question, une précision… (@ pour mentionner)"
			class="field-sizing-content max-h-40 min-h-9 flex-1 resize-none bg-transparent px-2 py-1.5 text-base outline-none"
			onkeydown={(e) => {
				if (e.key !== 'Enter' || e.shiftKey || e.isComposing) return;
				e.preventDefault();
				void send();
			}}></textarea>
		<button
			onclick={send}
			disabled={!text.trim() || sending}
			aria-label="Envoyer"
			class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-ink disabled:opacity-25"
		>
			<SendHorizontal size={16} />
		</button>
	</div>
	<QuestionHint {text} projectId={task.projectId} />
</div>
