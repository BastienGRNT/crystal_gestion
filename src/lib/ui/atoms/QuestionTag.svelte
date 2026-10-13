<script lang="ts">
	import { CircleCheck, MessageCircleQuestion } from '@lucide/svelte';

	interface Props {
		/** Who is asked, already joined: "Ana", "Ana et Léo". */
		names: string;
		answered: boolean;
		forMe?: boolean;
		/** "attend depuis 3 h". */
		waited?: string;
		onreply?: () => void;
		onresolve?: () => void;
	}

	let { names, answered, forMe = false, waited, onreply, onresolve }: Props = $props();
</script>

<p class="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm">
	{#if answered}
		<span class="inline-flex items-center gap-1 text-ok-text"
			><CircleCheck size={14} aria-hidden="true" />Question répondue</span
		>
	{:else}
		<span
			class="inline-flex items-center gap-1.5 rounded-md bg-warn-soft px-2 py-0.5 font-medium text-warn-text"
		>
			<MessageCircleQuestion size={14} aria-hidden="true" />
			{forMe ? 'On attend ta réponse' : `En attente de ${names}`}{waited ? ` · ${waited}` : ''}
		</span>
		{#if onreply}<button class="font-medium text-accent-text hover:underline" onclick={onreply}
				>Répondre</button
			>{/if}
		{#if onresolve}<button class="text-ink-3 hover:text-ink hover:underline" onclick={onresolve}
				>Clore</button
			>{/if}
	{/if}
</p>
