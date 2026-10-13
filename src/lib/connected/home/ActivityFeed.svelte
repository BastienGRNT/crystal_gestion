<script lang="ts">
	import { useApp } from '$lib/client/context';
	import { firstName, relativeTime } from '$lib/client/format';
	import { now } from '$lib/client/now.svelte';
	import { activityVerb, subjectHref } from '$lib/client/views/activity-text';
	import type { Project } from '$lib/modules/projects/domain/project';
	import Avatar from '$lib/ui/atoms/Avatar.svelte';

	let { project }: { project: Project } = $props();
	const { app } = useApp();
	const items = $derived(
		app.activities.all
			.filter((a) => a.projectId === project.id)
			.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
			.slice(0, 12)
	);
</script>

<section aria-labelledby="activity" class="flex flex-col gap-2">
	<h2 id="activity" class="text-lg font-semibold tracking-tight">Ce qui a bougé</h2>
	{#if items.length}
		<ol class="flex flex-col">
			{#each items as activity (activity.id)}
				{@const actor = app.users.get(activity.actorId)}
				<li>
					<a
						href={subjectHref(activity.subject, project.slug)}
						class="flex gap-3 rounded-xl px-2 py-2 hover:bg-hover"
					>
						{#if actor}<Avatar
								name={actor.name}
								color={actor.color}
								size="sm"
								class="mt-0.5"
							/>{/if}
						<span class="min-w-0 flex-1 text-base">
							<span class="font-semibold"
								>{activity.actorId === app.meId ? 'Toi' : firstName(actor?.name ?? '?')}</span
							>
							<span class="text-ink-2">{activityVerb(activity)}</span>
							{#if activity.subject.kind !== 'project'}<span class="font-medium"
									>« {activity.subject.title} »</span
								>{/if}
							<span class="block text-sm text-ink-3"
								>{relativeTime(activity.createdAt, now.value)}</span
							>
						</span>
					</a>
				</li>
			{/each}
		</ol>
	{:else}
		<p class="text-base text-ink-3">
			Les tâches commencées et finies, les fichiers déposés… apparaîtront ici.
		</p>
	{/if}
</section>
