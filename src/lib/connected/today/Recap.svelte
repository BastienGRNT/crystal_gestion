<script lang="ts">
	import { Sparkles } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import { toActivityView } from '$lib/client/views/activity';
	import { collapseActivity } from '$lib/modules/activity/domain/collapse';
	import { since } from '$lib/modules/activity/domain/activity';
	import EmptyState from '$lib/ui/molecules/EmptyState.svelte';
	import ActivityFeed from '$lib/ui/organisms/ActivityFeed.svelte';

	let { recapSince, limit = 12 }: { recapSince: string | null; limit?: number } = $props();
	const { store, refs, me } = useProject();
	const sorted = $derived([...store.activity.items].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
	const recent = $derived(collapseActivity(since(sorted, recapSince, me.id)));
	const items = $derived(
		recent.slice(0, limit).map((a) => toActivityView(a, store.members.get(a.actorId), (activity) => refs.href({ kind: activity.elementKind, ref: activity.elementRef })))
	);
</script>

{#if items.length}
	<ActivityFeed {items} />
	{#if recent.length > limit}<p class="mt-2 pl-9 text-[12.5px] text-ink-3">et {recent.length - limit} autres changements</p>{/if}
{:else}
	<EmptyState icon={Sparkles} title="Rien n’a bougé depuis ta dernière visite" text="Tu es à jour. Le résumé par l’IA arrivera ici plus tard." />
{/if}
