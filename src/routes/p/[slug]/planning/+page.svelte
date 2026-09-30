<script lang="ts">
	import { page } from '$app/state';
	import { formatDay } from '$lib/client/format';
	import PlanningAgenda from '$lib/connected/planning/PlanningAgenda.svelte';
	import PlanningHistory from '$lib/connected/planning/PlanningHistory.svelte';
	import { AgendaView } from '$lib/connected/planning/agenda-view.svelte';
	import { HistoryView } from '$lib/connected/planning/history-view.svelte';
	import { periodLabel } from '$lib/connected/planning/period-label';
	import { hrefWith } from '$lib/connected/planning/url-state';
	import Tabs from '$lib/ui/molecules/Tabs.svelte';
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

<Page>
	<PageHeader
		eyebrow="Planning"
		title={tab === 'agenda' ? periodLabel(agenda.days) : historyTitle}
		subtitle="Dis quand tu es dispo, vois quand les autres le sont, et où est passé le temps."
	/>
	<div class="-mt-2 mb-5">
		<Tabs
			label="Vues du planning"
			value={tab}
			tabs={[
				{ value: 'agenda', label: 'Agenda', href: hrefWith({ tab: null }) },
				{
					value: 'history',
					label: 'Bilan des semaines',
					short: 'Bilan',
					href: hrefWith({ tab: 'historique' })
				}
			]}
		/>
	</div>
	{#if tab === 'agenda'}<PlanningAgenda view={agenda} />{:else}<PlanningHistory
			view={history}
		/>{/if}
</Page>
