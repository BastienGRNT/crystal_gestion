<script lang="ts">
	import { page } from '$app/state';
	import { formatDay } from '$lib/client/format';
	import PlanningAgenda from '$lib/connected/planning/PlanningAgenda.svelte';
	import PlanningHistory from '$lib/connected/planning/PlanningHistory.svelte';
	import { AgendaView } from '$lib/connected/planning/agenda-view.svelte';
	import { HistoryView } from '$lib/connected/planning/history-view.svelte';
	import { periodLabel } from '$lib/connected/planning/period-label';
	import { hrefWith } from '$lib/connected/planning/url-state';
	import { CalendarDays, ChartColumn } from '@lucide/svelte';
	import PageTabs from '$lib/ui/molecules/PageTabs.svelte';
	import Page from '$lib/ui/templates/Page.svelte';
	import PageHeader from '$lib/ui/templates/PageHeader.svelte';

	const agenda = new AgendaView();
	const history = new HistoryView();
	const tab = $derived(page.url.searchParams.get('tab') === 'historique' ? 'history' : 'agenda');
	const historyTitle = $derived(
		[
			'Cette semaine',
			'Semaine dernière',
			`Semaine du ${formatDay(history.period.from, { day: 'numeric', month: 'long' })}`
		][Math.min(history.offset, 2)]
	);
	$effect(() => void (agenda.compact = matchMedia('(max-width: 767px)').matches));
</script>

<PageHeader
	title="Planning"
	meta={tab === 'agenda'
		? `Quand chacun est dispo, le temps passé, les échéances · ${periodLabel(agenda.days)}`
		: historyTitle}
>
	{#snippet tabs()}
		<PageTabs
			label="Vues du planning"
			value={tab}
			tabs={[
				{ value: 'agenda', label: 'Agenda', icon: CalendarDays, href: hrefWith({ tab: null }) },
				{
					value: 'history',
					label: 'Bilan des semaines',
					icon: ChartColumn,
					href: hrefWith({ tab: 'historique' })
				}
			]}
		/>
	{/snippet}
</PageHeader>
<Page width="max-w-[1480px]">
	{#if tab === 'agenda'}<PlanningAgenda view={agenda} />{:else}<PlanningHistory
			view={history}
		/>{/if}
</Page>
