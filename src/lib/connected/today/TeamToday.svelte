<script lang="ts">
	import { UserPlus } from '@lucide/svelte';
	import { useApp } from '$lib/client/context';
	import { firstName } from '$lib/client/format';
	import { now } from '$lib/client/now.svelte';
	import { presenceOf } from '$lib/client/views/presence';
	import { teammates, weekHours } from '$lib/client/views/today';
	import type { User } from '$lib/modules/identity/domain/user';
	import type { Project } from '$lib/modules/projects/domain/project';
	import type { Task } from '$lib/modules/tasks/domain/task';
	import Avatar from '$lib/ui/atoms/Avatar.svelte';
	import Button from '$lib/ui/atoms/Button.svelte';
	import ProjectTag from './ProjectTag.svelte';

	let { projects, tasks }: { projects: Project[]; tasks: Task[] } = $props();
	const { app, overlays } = useApp();
	const people = $derived(teammates(projects, app.members.all, app.users.all, app.meId));
	const hours = $derived(weekHours(app.blocks.all, now.value));
	const presence = (user: User) =>
		presenceOf(user, { online: app.online, slots: app.slots.all, tasks, now: now.value });
	function planned(userId: string) {
		const total = hours.get(userId) ?? 0;
		if (!total) return 'rien de prévu cette semaine';
		return `${total.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} h prévues cette semaine`;
	}
</script>

<section aria-labelledby="team-today" class="flex flex-col gap-3">
	<h2 id="team-today" class="text-lg font-semibold tracking-tight">L’équipe</h2>
	{#if people.length}
		<ul class="flex flex-col gap-2">
			{#each people as user (user.id)}
				{@const state = presence(user)}
				<li class="flex gap-3 rounded-xl border border-line bg-surface p-3 shadow-card">
					<Avatar name={user.name} color={user.color} size="md" dot={state.statusDot} />
					<div class="flex min-w-0 flex-1 flex-col gap-0.5">
						<p class="flex flex-wrap items-baseline gap-x-2">
							<span class="text-base font-semibold">{firstName(user.name)}</span>
							<span class={['text-sm', state.online ? 'text-ok-text' : 'text-ink-3']}
								>{state.seen}</span
							>
						</p>
						<p class="text-sm text-ink-2">
							{state.availability ?? 'Pas de dispo prévue aujourd’hui'} · {planned(user.id)}
						</p>
						{#if user.statusNote}<p class="text-sm text-ink-3">« {user.statusNote} »</p>{/if}
						{#if state.working.length}
							<ul class="mt-1 flex flex-col">
								{#each state.working as task (task.id)}
									<li>
										<button
											class="-mx-2 flex min-h-10 w-full flex-col justify-center rounded-lg px-2 text-left hover:bg-hover"
											onclick={() => overlays.openTask(task.id)}
										>
											<span class="truncate text-sm font-medium">{task.title}</span>
											<ProjectTag project={app.projects.get(task.projectId)} />
										</button>
									</li>
								{/each}
							</ul>
						{:else}
							<p class="text-sm text-ink-3">Rien en cours</p>
						{/if}
					</div>
				</li>
			{/each}
		</ul>
	{:else}
		<div
			class="flex flex-col items-start gap-3 rounded-xl border border-dashed border-line-strong p-4"
		>
			<p class="text-base text-ink-2">
				Tu bosses seul·e pour l’instant. Invite la personne avec qui tu travailles : tu verras ici
				qui est là et sur quoi.
			</p>
			<Button
				variant="primary"
				icon={UserPlus}
				onclick={() => (overlays.create = { kind: 'invite', projectId: projects[0].id })}
				>Inviter dans {projects[0].name}</Button
			>
		</div>
	{/if}
</section>
