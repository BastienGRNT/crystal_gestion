<script lang="ts">
	import { ArrowUpRight, Check, CornerDownLeft } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import { elapsed, firstName } from '$lib/client/format';
	import { now } from '$lib/client/now.svelte';
	import { LONG_WAIT_MS } from '$lib/client/views/questions';
	import { channelName } from '$lib/client/views/workspace';
	import type { Message } from '$lib/modules/chat/domain/chat';
	import type { Project } from '$lib/modules/projects/domain/project';
	import Avatar from '$lib/ui/atoms/Avatar.svelte';
	import Button from '$lib/ui/atoms/Button.svelte';
	import RichText from '$lib/ui/organisms/RichText.svelte';

	let { question, project }: { question: Message; project: Project } = $props();
	const { app, actions, overlays } = useApp();
	const asker = $derived(app.users.get(question.authorId));
	const channel = $derived(app.channels.get(question.channelId));
	const task = $derived(channel?.taskId ? app.tasks.get(channel.taskId) : undefined);
	const long = $derived(now.value.getTime() - Date.parse(question.createdAt) > LONG_WAIT_MS);
	let answer = $state('');
	let sending = $state(false);

	const nameOf = (id: string) => firstName(app.users.get(id)?.name ?? 'quelqu’un');
	const taskOf = (number: number) =>
		app.tasks.all.find((t) => t.projectId === project.id && t.number === number);

	function open() {
		if (task) overlays.openTask(task.id);
	}

	/** Answered from here, it lands as a reply in its conversation, and the question closes. */
	async function send(event: SubmitEvent) {
		event.preventDefault();
		if (!answer.trim() || sending || !channel) return;
		sending = true;
		const ok = task
			? await actions.chat.comment(task.id, answer)
			: await actions.chat.post(channel.id, answer, [], question.id);
		sending = false;
		if (!ok) return;
		answer = '';
		actions.chat.markRead(channel.id);
	}
</script>

<article
	aria-label="Question de {firstName(asker?.name ?? 'quelqu’un')}"
	class="flex flex-col gap-3 rounded-xl border border-warn/50 bg-surface p-4 shadow-card"
>
	<header class="flex items-start gap-2.5">
		{#if asker}<Avatar name={asker.name} color={asker.color} size="md" />{/if}
		<p class="min-w-0 flex-1 text-base">
			<span class="font-semibold">{firstName(asker?.name ?? 'Quelqu’un')}</span> te demande
			<span class="text-ink-3"
				>{task ? `sur « ${task.title} »` : channel ? `dans #${channelName(channel)}` : ''}</span
			>
			<span class={['block text-sm', long ? 'font-semibold text-warn-text' : 'text-ink-3']}
				>attend depuis {elapsed(question.createdAt, now.value)}</span
			>
		</p>
	</header>

	<div class="rounded-lg bg-surface-2 px-3.5 py-2.5">
		<RichText
			body={question.body}
			meId={app.meId}
			{nameOf}
			{taskOf}
			onopentask={(id) => overlays.openTask(id)}
		/>
	</div>

	<form onsubmit={send} class="relative">
		<input
			bind:value={answer}
			placeholder="Ta réponse…"
			aria-label="Ta réponse à {firstName(asker?.name ?? 'quelqu’un')}"
			class="h-11 w-full rounded-xl border border-line-strong/70 bg-surface pr-12 pl-3.5 text-base outline-none placeholder:text-ink-4 focus:border-accent focus:ring-4 focus:ring-accent-soft"
		/>
		<button
			type="submit"
			disabled={!answer.trim() || sending}
			aria-label="Envoyer la réponse"
			class="absolute top-1/2 right-1.5 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-ink-3 enabled:hover:bg-hover enabled:hover:text-ink disabled:opacity-40"
		>
			<CornerDownLeft size={16} />
		</button>
	</form>

	<div class="-mt-1 flex flex-wrap gap-1">
		<Button
			size="sm"
			variant="ghost"
			icon={ArrowUpRight}
			href={task || !channel
				? undefined
				: `/p/${project.slug}/discussion/${channel.id}?message=${question.id}`}
			onclick={task ? open : undefined}>Voir la conversation</Button
		>
		<Button size="sm" variant="ghost" icon={Check} onclick={() => actions.chat.resolve(question)}
			>Déjà répondu</Button
		>
	</div>
</article>
