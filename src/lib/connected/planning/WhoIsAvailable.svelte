<script lang="ts">
	import { useProject } from '$lib/client/context';
	import { formatTime } from '$lib/client/format';
	import { isOnDay } from '$lib/modules/planning/domain/availability';
	import AvailabilityRow from '$lib/ui/molecules/AvailabilityRow.svelte';

	const { store } = useProject();
	const today = new Date();
	const people = $derived(
		store.members.items
			.map((member) => ({
				...member,
				online: store.online.includes(member.id),
				ranges: store.availabilities.items
					.filter((slot) => slot.userId === member.id && isOnDay(slot, today))
					.sort((a, b) => a.startsAt.localeCompare(b.startsAt))
					.map((slot) => ({
						key: slot.id,
						label: `${formatTime(slot.startsAt)}–${formatTime(slot.endsAt)}`,
						maybe: slot.status === 'maybe'
					}))
			}))
			.filter((person) => person.online || person.ranges.length)
			.sort((a, b) => Number(b.online) - Number(a.online) || a.name.localeCompare(b.name))
	);
</script>

<section class="rounded-xl border border-line bg-surface px-4 py-2 shadow-card">
	{#if people.length}
		<ul class="divide-y divide-line">
			{#each people as person (person.id)}
				<AvailabilityRow {...person} />
			{/each}
		</ul>
	{:else}
		<p class="py-2 text-sm text-ink-2">Personne n’a indiqué de dispo aujourd’hui.</p>
	{/if}
</section>
