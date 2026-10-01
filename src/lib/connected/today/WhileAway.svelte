<script lang="ts">
	import { ChevronRight } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import { timeAgo } from '$lib/client/format';
	import { digestByPerson } from '$lib/client/views/catch-up';
	import { since } from '$lib/modules/activity/domain/activity';
	import Avatar from '$lib/ui/atoms/Avatar.svelte';
	import Card from '$lib/ui/molecules/Card.svelte';

	/** What the others did since my last visit, one sentence per person; details on demand. */
	let { recapSince }: { recapSince: string | null } = $props();
	const { store, refs, me } = useProject();
	const digest = $derived(
		digestByPerson(
			since(
				[...store.activity.items].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
				recapSince,
				me.id
			)
		)
	);
	let expanded = $state<string | null>(null);
</script>

<Card title={recapSince ? `Depuis ta dernière visite (${timeAgo(recapSince)})` : 'Ce qui a bougé'}>
	{#each digest as person (person.actorId)}
		{@const actor = store.members.get(person.actorId)}
		<div class="-mx-2">
			<button
				type="button"
				onclick={() => (expanded = expanded === person.actorId ? null : person.actorId)}
				aria-expanded={expanded === person.actorId}
				class="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left hover:bg-hover"
			>
				<Avatar name={actor?.name ?? '?'} color={actor?.color ?? 'var(--ink-3)'} size={22} />
				<span class="min-w-0 flex-1 text-ui"
					><span class="font-medium">{actor?.name ?? 'Quelqu’un'}</span>
					<span class="text-ink-2">{person.summary}</span></span
				>
				<ChevronRight
					size={14}
					class="shrink-0 text-ink-3 transition {expanded === person.actorId ? 'rotate-90' : ''}"
				/>
			</button>
			{#if expanded === person.actorId}
				<ul class="mb-1 ml-10 flex flex-col">
					{#each person.items.slice(0, 12) as item (item.id)}
						<li class="flex items-baseline gap-2 py-1 text-ui">
							<a
								href={refs.href({ kind: item.elementKind, ref: item.elementRef })}
								class="min-w-0 flex-1 truncate text-ink-2 hover:text-ink">{item.elementTitle}</a
							>
							<span class="shrink-0 text-xs text-ink-3">{timeAgo(item.createdAt)}</span>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	{:else}
		<p class="text-ui text-ink-3">Rien de neuf de la part des autres. Tu es à jour.</p>
	{/each}
</Card>
