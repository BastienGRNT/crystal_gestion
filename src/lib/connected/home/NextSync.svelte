<script lang="ts">
	import {
		Bug,
		CalendarClock,
		ChartLine,
		CircleCheckBig,
		Scissors,
		Eye,
		Hourglass,
		Inbox,
		MessageCircleQuestion,
		OctagonAlert,
		Rocket,
		Send,
		TriangleAlert
	} from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { useApp } from '$lib/client/context';
	import { dayLabel, firstName, joinNames, plural, rangeLabel, timeOf } from '$lib/client/format';
	import { toDisplay } from '$lib/client/mentions';
	import { now } from '$lib/client/now.svelte';
	import { plainText } from '$lib/client/rich-text';
	import { agendaOf, nextMoment, type AgendaItem } from '$lib/client/views/sync-point';
	import { generalOf } from '$lib/client/views/workspace';
	import { toasts } from '$lib/client/toasts.svelte';
	import { toDateKey } from '$lib/modules/kernel/domain/dates';
	import { daysInColumn } from '$lib/modules/tasks/domain/views';
	import type { Project } from '$lib/modules/projects/domain/project';
	import Button from '$lib/ui/atoms/Button.svelte';
	import type { Icon } from '$lib/ui/types';
	import { projectTasks } from '../projects/current.svelte';
	import { missingMetrics, roadmapHref, roadmapOf } from '../roadmap/roadmap-of';
	import { riskOf } from '../tasks/risk';
	import { teamOrder } from '../team/usePresence.svelte';

	let { project }: { project: Project } = $props();
	const { app, actions, overlays } = useApp();

	const teammates = $derived(
		teamOrder(app, project.id)
			.filter((u) => u.id !== app.meId)
			.map((u) => u.id)
	);
	const moment = $derived(nextMoment(app.slots.all, app.meId, teammates, now.value));
	const tasks = $derived(projectTasks(app, project.id));
	const roadmap = $derived(roadmapOf(app, project.id, now.today, now.value));
	const missing = $derived(missingMetrics(app, project.id, now.today));
	const agenda = $derived(
		agendaOf({
			step: roadmap.current && {
				id: roadmap.current.id,
				late: roadmap.currentForecast?.state === 'late',
				ready: !!roadmap.currentForecast?.ready
			},
			metricMissing: missing.length > 0,
			shipsReleases: app.releases.all.some((r) => r.projectId === project.id),
			tasks,
			questions: app.questions.all.filter((q) => q.projectId === project.id),
			risks: new Map(tasks.map((t) => [t.id, riskOf(app, t)])),
			now: now.value
		})
	);

	const nameOf = (id: string) => firstName(app.users.get(id)?.name ?? 'quelqu’un');
	const when = $derived(
		moment
			? moment.ongoing
				? `En ce moment, jusqu’à ${timeOf(moment.end.toISOString())}`
				: `${dayLabel(toDateKey(moment.start), now.today)} · ${rangeLabel(moment.start.toISOString(), moment.end.toISOString())}`
			: null
	);

	const ICONS: Record<AgendaItem['kind'], Icon> = {
		'step-late': Scissors,
		'step-ready': CircleCheckBig,
		metric: ChartLine,
		critical: Bug,
		unshipped: Rocket,
		question: MessageCircleQuestion,
		review: Eye,
		blocked: OctagonAlert,
		risk: TriangleAlert,
		sort: Inbox,
		stale: Hourglass
	};

	/** One line per item, the same on screen and in the message sent to the team. */
	function describe(item: AgendaItem): string {
		const task = item.taskId ? app.tasks.get(item.taskId) : undefined;
		const title = task ? `« ${task.title} »` : '';
		switch (item.kind) {
			case 'step-late':
				return `Étape « ${roadmap.current?.title} » : ${roadmap.currentForecast?.lateDays ?? 0} j de retard au rythme actuel, décider quoi couper`;
			case 'step-ready':
				return `Tout est fait pour « ${roadmap.current?.title} » : on la clôt ?`;
			case 'metric':
				return `Noter les chiffres de la semaine (${missing.map((m) => m.name).join(', ')})`;
			case 'critical':
				return `Bug bloquant ouvert depuis plus d’un jour : ${title}`;
			case 'unshipped':
				return `${plural(item.count ?? 0, 'tâche terminée attend', 'tâches terminées attendent')} la mise en prod depuis plus d’une semaine`;
			case 'question': {
				const q = item.question!;
				const text = plainText(toDisplay(q.body, app.users.all));
				return `${nameOf(q.authorId)} demande à ${joinNames(q.asks.map(nameOf))} : « ${text} »`;
			}
			case 'review':
				return `À relire : ${title}${task?.reviewerId ? ` (${nameOf(task.reviewerId)})` : ''}`;
			case 'blocked':
				return `Bloqué : ${title} · ${task?.blockedReason ?? ''}`;
			case 'risk':
				return `${title} : ${task ? (riskOf(app, task)?.text ?? '') : ''}`;
			case 'sort':
				return `${plural(item.count ?? 0, 'tâche')} à trier ensemble`;
			case 'stale':
				return `${title} ne bouge plus depuis ${task ? daysInColumn(task, now.value) : 0} j`;
		}
	}

	function open(item: AgendaItem) {
		if (item.taskId) return overlays.openTask(item.taskId);
		if (item.kind === 'sort') return void goto(`/p/${project.slug}/priorites`);
		if (item.milestoneId) return void goto(roadmapHref(project.slug, `etape-${item.milestoneId}`));
		if (item.kind === 'metric') return void goto(`/p/${project.slug}/indicateurs`);
		if (item.kind === 'unshipped') return void goto(`/p/${project.slug}/versions`);
		const q = item.question!;
		const taskId = app.channels.get(q.channelId)?.taskId;
		if (taskId) overlays.openTask(taskId);
		else void goto(`/p/${project.slug}/discussion/${q.channelId}?message=${q.id}`);
	}

	/** Names stay plain (no "@"): the agenda neither notifies anyone nor becomes a question. */
	async function share() {
		const general = generalOf(app.channels.all, project.id);
		if (!general) return;
		const lines = agenda.map((item) => `- ${describe(item).replace(/@/g, '')}`);
		const body = `Ordre du jour du point${when ? ` (${when.toLowerCase()})` : ''} :\n${lines.join('\n')}`;
		if (await actions.chat.post(general.id, body))
			toasts.show('Ordre du jour envoyé dans #général', { tone: 'success', duration: 3000 });
	}
</script>

{#if teammates.length}
	<section aria-labelledby="next-sync" class="flex flex-col gap-3">
		<h2 id="next-sync" class="text-lg font-semibold tracking-tight">Le prochain point</h2>
		<div class="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4 shadow-card">
			{#if moment}
				<p class="flex items-start gap-2.5">
					<CalendarClock
						size={18}
						class={['mt-0.5 shrink-0', moment.ongoing ? 'text-ok-text' : 'text-ink-3']}
						aria-hidden="true"
					/>
					<span class="min-w-0 flex-1">
						<span class="block text-base font-semibold">{when}</span>
						<span class="block text-sm text-ink-3"
							>{moment.ongoing ? 'Vous êtes dispo en même temps' : 'Dispo en même temps'} : toi et
							{joinNames(moment.with.map(nameOf))}</span
						>
					</span>
				</p>
			{:else}
				<p class="text-base text-ink-2">
					Pas de moment dispo en commun cette semaine.
					<a href="/p/{project.slug}/planning" class="font-medium text-accent-text hover:underline"
						>Poser tes dispos</a
					>
				</p>
			{/if}

			{#if agenda.length}
				<div class="flex flex-col gap-1">
					<p class="text-sm font-semibold text-ink-2">À voir ensemble</p>
					<ul class="-mx-2 flex flex-col">
						{#each agenda as item, i (item.question?.id ?? item.taskId ?? `${item.kind}-${i}`)}
							{@const ItemIcon = ICONS[item.kind]}
							<li>
								<button
									onclick={() => open(item)}
									class="flex min-h-10 w-full items-start gap-2.5 rounded-lg px-2 py-2 text-left text-sm hover:bg-hover"
								>
									<ItemIcon size={15} class="mt-0.5 shrink-0 text-ink-3" aria-hidden="true" />
									<span class="line-clamp-2 min-w-0 flex-1 text-ink-2">{describe(item)}</span>
								</button>
							</li>
						{/each}
					</ul>
				</div>
				<Button size="sm" icon={Send} class="self-start" onclick={share}
					>Envoyer l’ordre du jour</Button
				>
			{:else}
				<p class="text-sm text-ink-3">
					Rien à trancher ensemble : pas de question en suspens, rien de bloqué. Le point peut
					attendre.
				</p>
			{/if}
		</div>
	</section>
{/if}
