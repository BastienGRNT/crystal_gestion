<script lang="ts">
	import { useProject } from '$lib/client/context';
	import { isDraft } from '$lib/client/live/optimistic';
	import {
		DAY_PERIODS,
		overlaps,
		periodSlot,
		type DayPeriod
	} from '$lib/modules/planning/domain/availability';
	import ToggleChip from '$lib/ui/molecules/ToggleChip.svelte';
	import { dismiss, isDismissed } from './day-dismissal';

	const { store, actions, me } = useProject();
	const today = new Date();
	const periods = Object.entries(DAY_PERIODS) as [DayPeriod, (typeof DAY_PERIODS)[DayPeriod]][];
	let dismissed = $state(false);
	$effect(() => void (dismissed = isDismissed(today)));
	const slotsOf = (period: DayPeriod) =>
		store.availabilities.items.filter(
			(slot) => slot.userId === me.id && overlaps(slot, periodSlot(today, period))
		);
	function toggle(period: DayPeriod) {
		const existing = slotsOf(period);
		if (existing.some((slot) => isDraft(slot.id))) return;
		if (!existing.length) actions.planning.createAvailability(periodSlot(today, period));
		for (const slot of existing) actions.planning.removeAvailability(slot.id);
	}
	const notAvailable = () => ((dismissed = true), dismiss(today));
</script>

{#if !dismissed}
	<section class="rounded-xl border border-line bg-surface p-3 pl-4">
		<div class="mb-2.5 flex items-center justify-between gap-3">
			<p class="font-display text-[22px] leading-none">Dispo aujourd’hui ?</p>
			<button
				type="button"
				class="h-7 rounded-full px-2.5 text-[12.5px] text-ink-3 transition hover:bg-sunken hover:text-ink-2"
				onclick={notAvailable}>Pas dispo</button
			>
		</div>
		<div class="flex flex-wrap gap-2">
			{#each periods as [period, { label, from, to }] (period)}
				<ToggleChip pressed={slotsOf(period).length > 0} onclick={() => toggle(period)}>
					{label}<span class="font-mono text-[11px] opacity-60">{from}–{to}h</span>
				</ToggleChip>
			{/each}
		</div>
	</section>
{/if}
