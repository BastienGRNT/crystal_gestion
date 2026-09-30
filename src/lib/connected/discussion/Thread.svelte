<script lang="ts">
	import { untrack } from 'svelte';
	import { useProject } from '$lib/client/context';
	import { toasts } from '$lib/client/toasts.svelte';
	import type { Message } from '$lib/modules/discussion/domain/message';
	import { byCreatedAt, loadThread } from './thread-loader';
	import ThreadComposer from './ThreadComposer.svelte';
	import ThreadMessages from './ThreadMessages.svelte';

	/** A live conversation that fills its parent's height: give it a bounded height. */
	let { featureId, class: extra = '' }: { featureId: string | null; class?: string } = $props();
	const { store } = useProject();
	let loading = $state(true);
	let replyTo = $state<Message | null>(null);
	const feature = $derived(featureId ? store.features.get(featureId) : undefined);
	const messages = $derived(
		store.messages.items.filter((m) => m.featureId === featureId).sort(byCreatedAt)
	);

	$effect(() => {
		const thread = featureId;
		untrack(() => {
			loading = true;
			replyTo = null;
			loadThread(store, thread)
				.catch((cause: Error) => toasts.error(cause.message))
				.finally(() => (loading = false));
		});
	});
</script>

<div class="flex min-h-0 flex-col {extra}">
	<ThreadMessages {messages} {loading} general={!featureId} onreply={(m) => (replyTo = m)} />
	<div class="px-4 pb-4 sm:px-6">
		<ThreadComposer
			{featureId}
			bind:replyTo
			placeholder={feature ? `Écrire sur ${feature.title}…` : 'Écrire dans #général…'}
		/>
	</div>
</div>
