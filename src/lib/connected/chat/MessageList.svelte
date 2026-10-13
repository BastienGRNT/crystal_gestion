<script lang="ts">
	import { MessagesSquare } from '@lucide/svelte';
	import { tick, untrack } from 'svelte';
	import { useApp } from '$lib/client/context';
	import { now } from '$lib/client/now.svelte';
	import { messageViews } from '$lib/client/views/messages';
	import type { Channel, Message } from '$lib/modules/chat/domain/chat';
	import Spinner from '$lib/ui/atoms/Spinner.svelte';
	import EmptyState from '$lib/ui/molecules/EmptyState.svelte';
	import MessageItem from './MessageItem.svelte';

	interface Props {
		channel: Channel;
		/** When the channel was last read before opening it: where "Nouveaux" goes. */
		lastReadAt: string | null;
		highlight: string | null;
		onreply: (message: Message) => void;
	}

	let { channel, lastReadAt, highlight, onreply }: Props = $props();
	const { app } = useApp();
	const store = $derived(app.messages.of(channel.id));
	const views = $derived(
		messageViews(store.items, { lastReadAt, meId: app.meId, today: now.today })
	);
	let scroller = $state<HTMLDivElement>();
	let sentinel = $state<HTMLDivElement>();
	let stickToBottom = true;

	const nearBottom = () =>
		!scroller || scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 160;
	const toBottom = () => scroller && (scroller.scrollTop = scroller.scrollHeight);

	// New messages keep you at the bottom, unless you scrolled up to read older ones.
	$effect.pre(() => {
		void store.items.length;
		stickToBottom = nearBottom();
	});
	$effect(() => {
		const last = store.items.at(-1);
		if (!last) return;
		untrack(() => {
			if (stickToBottom || last.authorId === app.meId) void tick().then(toBottom);
		});
	});

	$effect(() => {
		if (!highlight || !store.loaded) return;
		void tick().then(() =>
			document.getElementById(`message-${highlight}`)?.scrollIntoView({ block: 'center' })
		);
	});

	/** Reaching the top loads older messages without making the view jump. */
	$effect(() => {
		if (!sentinel || !scroller) return;
		const observer = new IntersectionObserver(
			async ([entry]) => {
				if (!entry.isIntersecting || !store.loaded || !store.hasOlder || !scroller) return;
				const before = scroller.scrollHeight;
				await app.messages.loadOlder(channel.id);
				await tick();
				scroller.scrollTop += scroller.scrollHeight - before;
			},
			{ root: scroller }
		);
		observer.observe(sentinel);
		return () => observer.disconnect();
	});
</script>

<div
	bind:this={scroller}
	onloadcapture={() => stickToBottom && toBottom()}
	class="min-h-0 flex-1 scrollbar-thin overflow-y-auto py-4"
>
	<div bind:this={sentinel} class="h-px"></div>
	{#if !store.loaded}
		<div class="flex justify-center py-10 text-ink-3"><Spinner size={20} /></div>
	{:else if !store.items.length}
		<div class="mx-auto max-w-md px-4 py-16">
			<EmptyState
				icon={MessagesSquare}
				title="Rien ici pour l’instant"
				text="Pose une question, partage une capture, ou mentionne quelqu’un avec @ pour le prévenir."
			/>
		</div>
	{:else}
		{#if store.loading}<div class="flex justify-center py-3 text-ink-3"><Spinner /></div>{/if}
		{#if !store.hasOlder}<p class="px-6 pb-4 text-center text-sm text-ink-3">
				Début de la discussion
			</p>{/if}
		{#each views as view (view.message.id)}
			{#if view.dayBreak}
				<div class="sticky top-0 z-10 flex justify-center py-2">
					<span
						class="rounded-full border border-line bg-surface px-3 py-0.5 text-xs font-semibold text-ink-2 shadow-card"
						>{view.dayBreak}</span
					>
				</div>
			{/if}
			{#if view.unreadBreak}
				<div class="flex items-center gap-3 px-6 py-1" role="separator">
					<span class="h-px flex-1 bg-now/50"></span>
					<span class="text-xs font-semibold text-now-text">Nouveaux messages</span>
					<span class="h-px flex-1 bg-now/50"></span>
				</div>
			{/if}
			<MessageItem {view} {channel} {onreply} highlighted={view.message.id === highlight} />
		{/each}
	{/if}
</div>
