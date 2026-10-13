<script lang="ts">
	import { MessageCircleQuestion } from '@lucide/svelte';
	import type { Snippet } from 'svelte';
	import { useApp } from '$lib/client/context';
	import { firstName, joinNames } from '$lib/client/format';
	import { toStored } from '$lib/client/mentions';
	import { askedIn } from '$lib/modules/chat/domain/chat';
	import { memberId } from '$lib/modules/projects/domain/membership';

	interface Props {
		text: string;
		projectId: string;
		/** Shown when the draft asks nobody. */
		children?: Snippet;
	}

	let { text, projectId, children }: Props = $props();
	const { app } = useApp();
	const asked = $derived(
		askedIn(toStored(text, app.users.all), app.meId)
			.filter((id) => app.members.get(memberId(projectId, id)))
			.map((id) => firstName(app.users.get(id)?.name ?? ''))
	);
</script>

<!-- Says it before sending: a mention with a "?" is followed until it gets an answer. -->
{#if asked.length}
	<p class="flex items-center gap-1.5 px-1 text-xs font-medium text-warn-text">
		<MessageCircleQuestion size={13} aria-hidden="true" />
		Question pour {joinNames(asked)} : suivie sur {asked.length > 1 ? 'leur' : 'son'} accueil jusqu’à
		la réponse.
	</p>
{:else}
	{@render children?.()}
{/if}
