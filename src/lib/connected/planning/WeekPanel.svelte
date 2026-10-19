<script lang="ts">
	import { CalendarClock, Flag, WandSparkles } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import { tint } from '$lib/client/labels';
	import { now } from '$lib/client/now.svelte';
	import {
		hourLabel,
		hoursLabel,
		personWeek,
		spanLabel,
		weekBlocks,
		weekDeadlines
	} from '$lib/client/views/week-plan';
	import { addDays, atMinutes, dayKey } from '$lib/modules/planning/domain/calendar';
	import { parseDateKey } from '$lib/modules/kernel/domain/dates';
	import type { Project } from '$lib/modules/projects/domain/project';
	import Avatar from '$lib/ui/atoms/Avatar.svelte';
	import Button from '$lib/ui/atoms/Button.svelte';
	import PersonLoad from '$lib/ui/organisms/agenda/PersonLoad.svelte';
	import PlaceRow from '$lib/ui/organisms/agenda/PlaceRow.svelte';
	import { teamOrder } from '../team/usePresence.svelte';
	import { sharedBands } from './agenda-bands';
	import type { usePlacing } from './placing.svelte';

	interface Props {
		project: Project;
		/** The seven days of the week shown. */
		days: Date[];
		placing: ReturnType<typeof usePlacing>;
	}

	let { project, days, placing }: Props = $props();
	const { app, overlays } = useApp();
	const SHOWN = 8;

	const week = $derived({ from: days[0], to: addDays(days[0], 7) });
	// In the week under way, what is over no longer helps anyone plan.
	const current = $derived(week.from <= now.value && now.value < week.to);
	const ahead = (end: Date) => !current || end > now.value;
	const people = $derived(teamOrder(app, project.id));
	const ids = $derived(new Set(people.map((p) => p.id)));
	const firstName = (id: string) => app.users.get(id)?.name.split(' ')[0] ?? '';
	const projectName = (id: string) => app.projects.get(id)?.name ?? 'Autre projet';
	const weekday = new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric' });

	const loads = $derived(
		people.map((person) => {
			const load = personWeek(person.id, app.slots.all, app.blocks.all, week);
			const detail =
				load.byProject.length > 1 || load.byProject[0]?.projectId !== project.id
					? load.byProject
							.map((p) => `${projectName(p.projectId)} ${hoursLabel(p.minutes)}`)
							.join(', ')
					: '';
			return { person, load, detail };
		})
	);

	const together = $derived(
		people.length > 1
			? sharedBands(
					days,
					app.slots.all.filter((s) => ids.has(s.userId)),
					firstName
				)
					.map((band) => ({
						...band,
						from: atMinutes(days[band.day], band.start),
						to: atMinutes(days[band.day], band.end)
					}))
					.filter((band) => ahead(band.to))
			: []
	);

	const toPlace = $derived(placing.toPlace);
	const deadlines = $derived(
		weekDeadlines(days.map(dayKey), {
			tasks: app.tasks.all.filter((t) => t.projectId === project.id),
			milestones: app.milestones.all.filter((m) => m.projectId === project.id),
			deadline: project.deadline
		})
	);

	const others = $derived(
		people
			.filter((p) => p.id !== app.meId)
			.map((person) => ({
				person,
				blocks: weekBlocks(person.id, app.blocks.all, week)
					.filter((b) => ahead(new Date(b.endsAt)))
					.map((b) => {
						const task = app.tasks.get(b.taskId);
						const where = b.projectId === project.id ? '' : projectName(b.projectId);
						const what = task ? `#${task.number} ${task.title}` : where || 'Travail';
						return {
							id: b.id,
							when: spanLabel(b),
							what: task && where ? `${what} (${where})` : what
						};
					}),
				doing: app.tasks.all.filter((t) => t.assigneeId === person.id && t.status === 'doing')
			}))
	);
	const section = 'flex flex-col gap-2.5 border-t border-line px-4 py-4 first:border-t-0';
	const heading = 'text-md font-semibold tracking-tight';
</script>

<aside
	class="flex flex-col rounded-2xl border border-line bg-surface lg:w-[360px] lg:shrink-0"
	aria-label="La semaine"
>
	<section class={section}>
		<h2 class={heading}>Par personne</h2>
		{#each loads as { person, load, detail } (person.id)}
			<PersonLoad
				name={person.name}
				suffix={person.id === app.meId ? 'toi' : ''}
				colorIndex={person.color}
				color={tint(person.color)}
				available={load.available}
				planned={load.planned}
				free={load.free}
				label={hoursLabel}
				{detail}
			/>
		{/each}
	</section>

	{#if people.length > 1}
		<section class={section}>
			<h2 class={heading}>Ensemble</h2>
			{#if together.length}
				<ul class="flex flex-col gap-1">
					{#each together as band (`${band.day}-${band.start}`)}
						<li class="flex items-baseline gap-2">
							<span class="w-16 shrink-0 text-sm text-ink-3">{weekday.format(band.from)}</span>
							<span class="font-medium">{hourLabel(band.from)}–{hourLabel(band.to)}</span>
							{#if people.length > 2}<span class="truncate text-sm text-ink-3"
									>{band.names.join(', ')}</span
								>{/if}
						</li>
					{/each}
				</ul>
			{:else}
				<p class="text-ink-3">
					Aucun moment dispo à plusieurs{current ? ' d’ici dimanche' : ' cette semaine'} : chacun indique
					ses dispos sur la grille.
				</p>
			{/if}
		</section>
	{/if}

	<section class={section}>
		<div class="flex items-center gap-2">
			<h2 class="{heading} flex-1">À poser</h2>
			{#if toPlace.length}
				<Button size="sm" variant="accent" icon={WandSparkles} onclick={placing.proposeWeek}
					>Proposer la semaine</Button
				>
			{/if}
		</div>
		{#if toPlace.length}
			<p class="text-sm text-ink-3">
				Tes tâches sans créneau cette semaine. « Poser » les met dans ta prochaine dispo libre (2 h
				au plus) ; tu peux aussi les glisser sur la grille.
			</p>
			<ul class="-mx-2 flex flex-col">
				{#each toPlace.slice(0, SHOWN) as task (task.id)}
					<PlaceRow
						id={task.id}
						number={task.number}
						title={task.title}
						kind={task.kind}
						critical={task.critical}
						dueDate={task.dueDate}
						today={now.today}
						onopen={() => overlays.openTask(task.id)}
						onplace={() => placing.place(task.id)}
					/>
				{/each}
			</ul>
			{#if toPlace.length > SHOWN}
				<p class="text-sm text-ink-3">
					+ {toPlace.length - SHOWN}
					{toPlace.length - SHOWN > 1 ? 'autres' : 'autre'} (« Proposer la semaine » les pose aussi)
				</p>
			{/if}
		{:else}
			<p class="text-ink-3">Toutes tes tâches à faire ont un créneau cette semaine.</p>
		{/if}
	</section>

	<section class={section}>
		<h2 class={heading}>Échéances et étapes</h2>
		{#if deadlines.length}
			<ul class="-mx-2 flex flex-col">
				{#each deadlines as item (item.id)}
					<li>
						<button
							type="button"
							disabled={!item.taskId}
							onclick={() => item.taskId && overlays.openTask(item.taskId)}
							class="flex min-h-10 w-full items-center gap-2 rounded-lg px-2 text-left enabled:hover:bg-hover"
						>
							<span
								class="w-16 shrink-0 text-sm {item.day < now.today
									? 'text-danger-text'
									: 'text-ink-3'}">{weekday.format(parseDateKey(item.day))}</span
							>
							{#if item.kind === 'task'}
								<CalendarClock size={15} class="shrink-0 text-ink-3" aria-hidden="true" />
								<span class="shrink-0 font-mono text-sm text-ink-3">{item.ref}</span>
							{:else}
								<Flag
									size={15}
									class="shrink-0 {item.kind === 'delivery' ? 'text-now' : 'text-plan'}"
									aria-hidden="true"
								/>
							{/if}
							<span class="truncate {item.kind === 'task' ? '' : 'font-medium'}">{item.title}</span>
						</button>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="text-ink-3">Rien d’attendu pour un jour précis cette semaine.</p>
		{/if}
	</section>

	{#each others as { person, blocks, doing } (person.id)}
		<section class={section}>
			<h2 class="{heading} flex items-center gap-2">
				<Avatar name={person.name} color={person.color} size="sm" />
				Ce que fait {firstName(person.id)}
			</h2>
			{#if blocks.length}
				<ul class="flex flex-col gap-1">
					{#each blocks.slice(0, 6) as block (block.id)}
						<li class="flex min-w-0 items-baseline gap-2">
							<span class="shrink-0 text-sm text-ink-3">{block.when}</span>
							<span class="truncate">{block.what}</span>
						</li>
					{/each}
				</ul>
				{#if blocks.length > 6}<p class="text-sm text-ink-3">+ {blocks.length - 6} autres</p>{/if}
			{/if}
			{#if doing.length}
				<p class="text-sm font-medium text-ink-2">En cours</p>
				<ul class="-mx-2 flex flex-col">
					{#each doing as task (task.id)}
						<li>
							<button
								type="button"
								onclick={() => overlays.openTask(task.id)}
								class="flex min-h-10 w-full min-w-0 items-center gap-2 rounded-lg px-2 text-left hover:bg-hover"
							>
								<span class="shrink-0 font-mono text-sm text-ink-3">#{task.number}</span>
								<span class="truncate">{task.title}</span>
								{#if task.projectId !== project.id}<span class="shrink-0 text-sm text-ink-3"
										>{projectName(task.projectId)}</span
									>{/if}
							</button>
						</li>
					{/each}
				</ul>
			{/if}
			{#if !blocks.length && !doing.length}
				<p class="text-ink-3">Rien de prévu ni en cours{current ? ' d’ici dimanche' : ''}.</p>
			{/if}
		</section>
	{/each}
</aside>
