<script lang="ts">
	import { CalendarCheck2, Copy, PencilLine } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import { hasSlots, typicalWeek } from '$lib/client/views/week-plan';
	import { addDays } from '$lib/modules/planning/domain/calendar';
	import Button from '$lib/ui/atoms/Button.svelte';

	let { monday, ondraw }: { monday: Date; ondraw: () => void } = $props();
	const { app, actions } = useApp();
	const before = $derived(addDays(monday, -7));
	const canCopy = $derived(hasSlots(app.meId, app.slots.all, { from: before, to: monday }));
</script>

<!-- Without availability, nothing else on this page can be worked out: ask for it first. -->
<div
	class="flex flex-col gap-3 rounded-2xl border border-accent/25 bg-accent-soft px-4 py-4 sm:px-5"
>
	<p class="text-base">
		<span class="font-semibold text-accent-text">Dis quand tu peux travailler cette semaine :</span>
		Crystal en déduit vos moments ensemble et si les échéances tiennent.
	</p>
	<div class="flex flex-wrap gap-2">
		{#if canCopy}
			<Button variant="accent" icon={Copy} onclick={() => actions.planning.copyWeek(before, monday)}
				>Reprendre la semaine d’avant</Button
			>
		{/if}
		<Button
			variant={canCopy ? 'secondary' : 'accent'}
			icon={CalendarCheck2}
			onclick={() =>
				actions.planning.createSlots(
					typicalWeek(monday),
					'Semaine type ajoutée : ajuste-la au besoin'
				)}>Lun–ven · 9 h–12 h et 14 h–18 h</Button
		>
		<Button variant="ghost" icon={PencilLine} onclick={ondraw}>Je dessine moi-même</Button>
	</div>
</div>
