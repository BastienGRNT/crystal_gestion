<script lang="ts">
	import { Check, CornerUpLeft } from '@lucide/svelte';
	import Avatar from '../../atoms/Avatar.svelte';
	import RichText from '../../molecules/RichText.svelte';
	import type { QuestionView, RefView } from '../../types';

	interface Props {
		items: QuestionView[];
		resolve: (ref: string) => RefView | undefined;
		onresolve: (id: string) => void;
		onreply: (id: string, body: string) => void;
	}

	let { items, resolve, onresolve, onreply }: Props = $props();
	let replying = $state<string | null>(null);
	let draft = $state('');

	function keydown(event: KeyboardEvent, id: string) {
		if (event.key === 'Escape') replying = null;
		if (event.key !== 'Enter' || !draft.trim()) return;
		onreply(id, draft.trim());
		replying = null;
		draft = '';
	}
	const button = 'inline-flex h-7 items-center gap-1.5 rounded-[7px] px-2.5 text-xs font-medium';
</script>

<ul class="flex flex-col divide-y divide-line">
	{#each items as item (item.id)}
		<li class="flex animate-rise flex-col gap-2 py-2">
			<p class="flex items-center gap-2 text-xs text-ink-3">
				<Avatar name={item.author.name} color={item.author.color} size={20} />
				<a href={item.href} class="hover:text-ink"
					><span class="font-medium text-ink">{item.author.name}</span> · {item.when}</a
				>
			</p>
			<RichText text={item.excerpt} {resolve} class="text-sm leading-normal" />
			{#if replying === item.id}
				<!-- svelte-ignore a11y_autofocus -->
				<input
					bind:value={draft}
					autofocus
					onkeydown={(e) => keydown(e, item.id)}
					placeholder="Ta réponse — Entrée pour envoyer"
					class="h-[34px] rounded-lg border border-accent bg-surface px-2.5 text-sm outline-none"
				/>
			{:else}
				<div class="flex gap-1.5">
					<button
						onclick={() => ((replying = item.id), (draft = ''))}
						class="{button} bg-accent text-accent-ink"><CornerUpLeft size={13} /> Répondre</button
					>
					<button
						onclick={() => onresolve(item.id)}
						class="{button} border border-line text-ink-2 hover:bg-hover"
						><Check size={13} /> Traité</button
					>
				</div>
			{/if}
		</li>
	{/each}
</ul>
