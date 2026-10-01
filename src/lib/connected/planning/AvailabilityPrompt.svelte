<script lang="ts">
	import { useProject } from '$lib/client/context';
	import { isOnDay } from '$lib/modules/planning/domain/availability';
	import { formatMinutes } from '$lib/modules/time/domain/time-entry';
	import Button from '$lib/ui/atoms/Button.svelte';
	import { dismiss, isDismissed } from './day-dismissal';
	import { clock, clockOf, quarterSteps, rangeFrom, STEP_MINUTES } from './until-range';

	const { store, actions, me } = useProject();
	const today = new Date();
	const { start, max } = quarterSteps(today);
	let steps = $state(Math.min(8, max));
	let dismissed = $state(false);
	$effect(() => void (dismissed = isDismissed(today)));
	const mine = $derived(
		store.availabilities.items
			.filter((slot) => slot.userId === me.id && isOnDay(slot, today))
			.sort((a, b) => a.startsAt.localeCompare(b.startsAt))
	);
	const notAvailable = () => ((dismissed = true), dismiss(today));
</script>

{#if !dismissed && max > 0}
	<section class="rounded-xl border border-line bg-surface px-4 py-3.5">
		<div class="mb-2.5 flex items-center justify-between gap-3">
			<h2 class="text-sm font-semibold">Tu es dispo aujourd’hui ?</h2>
			{#if !mine.length}<button
					type="button"
					class="h-7 rounded-full px-2.5 text-xs text-ink-3 transition hover:bg-hover hover:text-ink-2"
					onclick={notAvailable}>Pas dispo</button
				>{/if}
		</div>
		{#each mine as slot (slot.id)}
			<p class="mb-2 flex items-center gap-2 rounded-lg bg-accent-soft px-3 py-2 text-sm">
				<span class="font-mono">{clockOf(slot.startsAt)}–{clockOf(slot.endsAt)}</span>
				<button
					type="button"
					class="ml-auto text-ink-3 hover:text-ink"
					onclick={() => actions.planning.removeAvailability(slot.id)}>Retirer</button
				>
			</p>
		{/each}
		<label class="block text-sm text-ink-2" for="dispo-until">
			De <span class="font-mono text-ink">{clock(start)}</span> jusqu’à
			<span class="font-mono text-ink">{clock(start + steps * STEP_MINUTES)}</span>
			<span class="text-ink-3">· {formatMinutes(steps * STEP_MINUTES)}</span>
		</label>
		<input
			id="dispo-until"
			type="range"
			min="1"
			{max}
			bind:value={steps}
			class="my-3 w-full accent-accent"
		/>
		<div class="flex items-center justify-between gap-3">
			<a href="/p/{store.project.slug}/planning" class="text-sm text-ink-3 hover:text-ink-2"
				>Plus précis : planning →</a
			>
			<Button
				variant="primary"
				size="sm"
				onclick={() => actions.planning.createAvailability(rangeFrom(today, start, steps))}
				>Valider</Button
			>
		</div>
	</section>
{/if}
