<script lang="ts">
	import { CalendarCheck, CalendarRange, ClipboardCheck } from '@lucide/svelte';
	import { useProject } from '$lib/client/context';
	import MenuItem from '$lib/ui/molecules/MenuItem.svelte';
	import Popover from '$lib/ui/molecules/Popover.svelte';

	const { store } = useProject();
	let open = $state(false);
	const base = $derived(`/p/${store.project.slug}/review`);
</script>

<Popover {open} align="end" onclose={() => (open = false)} width="w-72">
	{#snippet trigger()}
		<button
			type="button"
			onclick={() => (open = !open)}
			class="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-surface px-3.5 text-ui font-medium transition hover:border-line-strong"
			><ClipboardCheck size={15} />Faire le point</button
		>
	{/snippet}
	<MenuItem href="{base}?mode=day" onclick={() => (open = false)}>
		<CalendarCheck size={15} />
		<span class="flex-1"
			>Le point du jour<span class="block text-xs text-ink-3">2 min · fait, bloqué, demain</span
			></span
		>
	</MenuItem>
	<MenuItem href={base} onclick={() => (open = false)}>
		<CalendarRange size={15} />
		<span class="flex-1"
			>La revue de la semaine<span class="block text-xs text-ink-3"
				>10 min · avancement, bloqué, questions, idées</span
			></span
		>
	</MenuItem>
</Popover>
