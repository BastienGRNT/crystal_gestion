<script lang="ts">
	import { untrack } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { useProject } from '$lib/client/context';
	import type { Message } from '$lib/modules/discussion/domain/message';
	import MessageRow from './MessageRow.svelte';
	import { toMessageView } from './message-views';
	import ThreadEmpty from './ThreadEmpty.svelte';
	import { ThreadScroll } from './thread-scroll.svelte';
	import { viewContext } from './view-context';

	interface Props {
		messages: Message[];
		loading: boolean;
		general: boolean;
		onreply: (message: Message) => void;
	}

	let { messages, loading, general, onreply }: Props = $props();
	const { store, refs, me } = useProject();
	const scroll = new ThreadScroll();
	const context = $derived(viewContext(store, refs, me.id));

	$effect.pre(() => {
		void messages.length;
		untrack(() => scroll.measure());
	});
	$effect(() => {
		const last = messages.at(-1);
		if (!loading) untrack(() => scroll.follow(last?.authorId === me.id));
	});
	$effect(() => {
		const ref = page.url.hash.slice(1);
		if (!loading && ref) untrack(() => scroll.reveal(ref));
	});

	const jump = async (ref: string) =>
		(await scroll.reveal(ref)) || goto(`/p/${store.project.slug}/go/${ref}`);
</script>

<div bind:this={scroll.element} class="min-h-0 flex-1 overflow-y-auto overscroll-contain pt-4 pb-3">
	{#if loading || !messages.length}
		<ThreadEmpty {loading} {general} />
	{:else}
		<div class="flex min-h-full flex-col justify-end">
			{#each messages as message, index (message.id)}
				<MessageRow
					{message}
					view={toMessageView(message, messages[index - 1], context)}
					highlighted={scroll.highlighted === message.ref}
					{onreply}
					onjump={jump}
				/>
			{/each}
		</div>
	{/if}
</div>
