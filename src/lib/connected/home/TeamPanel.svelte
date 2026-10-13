<script lang="ts">
	import { UserPlus } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { useApp } from '$lib/client/context';
	import { firstName } from '$lib/client/format';
	import { generalOf } from '$lib/client/views/workspace';
	import type { User } from '$lib/modules/identity/domain/user';
	import type { Project } from '$lib/modules/projects/domain/project';
	import Button from '$lib/ui/atoms/Button.svelte';
	import PersonCard from '$lib/ui/organisms/PersonCard.svelte';
	import { presenceFor, recentlyDone, teamOrder } from '../team/usePresence.svelte';

	let { project }: { project: Project } = $props();
	const { app, overlays } = useApp();
	const others = $derived(teamOrder(app, project.id).filter((u) => u.id !== app.meId));

	function writeTo(user: User) {
		const general = generalOf(app.channels.all, project.id);
		if (general)
			void goto(
				`/p/${project.slug}/discussion/${general.id}?ecrire=${encodeURIComponent(`@${firstName(user.name)} `)}`
			);
	}
</script>

<section aria-labelledby="team" class="flex flex-col gap-3">
	<h2 id="team" class="text-lg font-semibold tracking-tight">L’équipe</h2>
	{#each others as user (user.id)}
		<PersonCard
			{user}
			presence={presenceFor(app, user, project.id)}
			recentDone={recentlyDone(app, user.id, project.id)}
			onopentask={(task) => overlays.openTask(task.id)}
			onassign={() => overlays.newTask({ projectId: project.id, assigneeId: user.id })}
			onmessage={() => writeTo(user)}
		/>
	{:else}
		<div
			class="flex flex-col gap-3 rounded-2xl border border-dashed border-line-strong bg-surface p-5"
		>
			<p class="text-base text-ink-2">
				Invite la personne avec qui tu bosses : vous verrez qui est là, qui fait quoi, et vous
				pourrez vous écrire.
			</p>
			<Button
				variant="primary"
				icon={UserPlus}
				class="self-start"
				onclick={() => (overlays.create = { kind: 'invite', projectId: project.id })}
				>Inviter</Button
			>
		</div>
	{/each}
</section>
